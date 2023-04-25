import chatGPT from "./bots/chatgpt";
import chatGPTPlus from "./bots/chagpt+";
import languageChain from "./bots/languagechain";

import { sendMessageToTelegram } from "./utils/telegram";

const broadcast = async (phrase) => {
  const conversationsResult = await process.process.env.conversations.list();
  const conversations = conversationsResult.keys.map((k) => k.name);

  await Promise.all(
    conversations.map((key) => sendMessageToTelegram(key, phrase))
  );
};

const telegramChat = async ({
  chatId,
  username,
  text,
  message_id: messageId,
}) => {
  const value = await process.env.conversations.get(chatId);
  const { conversationId, parentMessageId, lastMessage } = value
    ? JSON.parse(value)
    : {};

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

    // Don't ever use switchcases like this unless you're mandated by some higher power:
    case "/start":
      prompt = "Hello !";

    // eslint-disable-next-line no-fallthrough
    default:
  }

  const ALLOWED_GPTCHAIN_USERS = [];
  const ALLOWED_CHATGPTPLUS_USERS = [process.env.ADMIN_CHAT_ID];

  let result;
  if (ALLOWED_GPTCHAIN_USERS.includes(chatId.toString())) {
    const textResult = await languageChain(prompt);
    result = {
      text: textResult,
      conversationId,
      parentMessageId,
    };
  } else if (ALLOWED_CHATGPTPLUS_USERS.includes(chatId.toString())) {
    result = await chatGPTPlus(prompt, username, messageId, lastMessage, {
      conversationId,
      parentMessageId,
    });
  } else {
    result = await chatGPT(prompt, {
      conversationId,
      parentMessageId,
    });
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
    })
  );
};

const chatWrapped = async (message) => {
  const {
    chat: { id: chatId, username },
    text,
    message_id,
  } = message;

  try {
    await telegramChat({ chatId, username, text, message_id });
  } catch (err) {
    console.error(err);
    await sendMessageToTelegram(
      process.env.ADMIN_CHAT_ID,
      `Error on ${username} (${chatId}):\n${err.message}`
    );
  }
};

export default chatWrapped;
