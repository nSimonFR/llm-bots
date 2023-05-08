import chatGPT from "./bots/chatgpt";
import chatGPTPlus from "./bots/chagpt+";
import { GPTChain, GPTSQL } from "./bots/langchain";

// import transcribeAudioToText from "./utils/speechtotext";
import {
  // getAudioFromTelegram,
  sendMessageToTelegram,
} from "./utils/telegram";

const BOTS = {
  chatgpt: "chatgpt",
  gptplus: "gptplus",
  gptchain: "gptchain",
  sqlchain: "sqlchain",
};

const broadcast = async (phrase) => {
  const conversationsResult = await process.process.env.conversations.list();
  const conversations = conversationsResult.keys.map((k) => k.name);

  await Promise.all(
    conversations.map((key) => sendMessageToTelegram(key, phrase))
  );
};

const botCommand = async (chatId, botType, newBotType, storageParams) => {
  const ALLOWED_USERS = [process.env.ADMIN_CHAT_ID];
  if (!ALLOWED_USERS.includes(chatId.toString())) {
    throw new Error(`Not allowed botchange`);
  }
  if (!newBotType) {
    await sendMessageToTelegram(chatId, `You are using ${botType}.`);
  } else if (!BOTS[newBotType]) {
    await sendMessageToTelegram(
      chatId,
      [
        `Unkown bot type: ${newBotType} - available:`,
        ...Object.keys(BOTS),
      ].join("\n- ")
    );
  } else {
    await process.env.conversations.put(
      chatId,
      JSON.stringify({
        ...storageParams,
        botType: BOTS[newBotType],
      })
    );
    await sendMessageToTelegram(chatId, `Switched to ${newBotType}.`);
  }
};

const telegramChat = async ({
  chatId,
  username,
  text,
  message_id: messageId,
}) => {
  const json = await process.env.conversations.get(chatId, { type: "json" });
  const {
    conversationId,
    parentMessageId,
    lastMessage,
    botType = BOTS.chatgpt,
  } = json || {};

  const words = text.split(" ");
  let prompt = text;
  switch (words[0]) {
    case "/bc": {
      const phrase = words.slice(1).join(" ");
      await broadcast(`_Broadcast message from Admin:_\n${phrase}`);
      return;
    }

    case "/feedback": {
      const phrase = words.slice(1).join(" ");
      await sendMessageToTelegram(
        process.env.ADMIN_CHAT_ID,
        `Feedback from ${username} (${chatId}):\n${phrase}`
      );
      return;
    }

    case "/tchat": {
      const receiverChatId = words[1];
      const phrase = words.slice(2).join(" ");
      await sendMessageToTelegram(
        receiverChatId,
        `_Direct message from Admin:_\n${phrase}`
      );
      return;
    }

    case "/bot": {
      await botCommand(chatId, botType, words[1], {
        username,
        messageId,
        lastMessage,
        conversationId,
        parentMessageId,
      });
      return;
    }

    // Don't ever use switchcases like this unless you're mandated by some higher power:
    case "/start":
      prompt = "Hello !";

    // eslint-disable-next-line no-fallthrough
    default:
  }

  let result;
  switch (botType) {
    case BOTS.gptchain: {
      const textResult = await GPTChain(prompt);
      result = {
        text: textResult,
        conversationId,
        parentMessageId,
      };
      break;
    }

    case BOTS.sqlchain: {
      const textResult = await GPTSQL(prompt);
      result = {
        text: textResult,
        conversationId,
        parentMessageId,
      };
      break;
    }

    case BOTS.gptplus: {
      result = await chatGPTPlus(prompt, username, messageId, lastMessage, {
        conversationId,
        parentMessageId,
      });
      break;
    }

    case BOTS.chatgpt: {
      result = await chatGPT(
        prompt,
        {
          conversationId,
          parentMessageId,
        },
        chatId.toString() === process.env.ADMIN_CHAT_ID
      );
      break;
    }

    default: {
      throw new Error(`Unknown bot ${botType}`);
    }
  }

  await sendMessageToTelegram(chatId, result.text);

  if (result.error) {
    throw new Error(result.text);
  }
  if (!result.id) return;

  await process.env.conversations.put(
    chatId,
    JSON.stringify({
      username,
      messageId,
      lastMessage: result.text,
      conversationId: result.conversationId,
      parentMessageId: result.id,
      botType,
    })
  );
};

const chatWrapped = async ({
  chat: { id: chatId, username },
  text,
  // voice,
  message_id,
}) => {
  try {
    if (!text) {
      // if (voice) {
      //   const audio = await getAudioFromTelegram(voice.file_id);
      //   // eslint-disable-next-line no-param-reassign
      //   text = await transcribeAudioToText(audio);
      // } else {
      throw new Error("no text");
      // }
    }
    await telegramChat({ chatId, username, text, message_id });
  } catch (err) {
    console.error(err.stack);
    await sendMessageToTelegram(
      process.env.ADMIN_CHAT_ID,
      `Error on ${username} (${chatId}):\n${err.stack}`
    );
  }
};

export default chatWrapped;
