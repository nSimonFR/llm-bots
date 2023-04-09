import chatGPT from "./bots/chatgpt";
import jarvis from "./bots/jarvis";

const sendMessageToTelegram = async (env, chatId, unprocessedText) => {
  const text = unprocessedText.replace("#", "");
  const telegramURL = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendMessage`;
  await fetch(
    `${telegramURL}?chat_id=${chatId}&text=${text}&parse_mode=Markdown`
  );
};

const broadcast = async (env, phrase) => {
  const conversationsResult = await env.conversations.list();
  const conversations = conversationsResult.keys.map((k) => k.name);

  await Promise.all(
    conversations.map((key) => sendMessageToTelegram(env, key, phrase))
  );
};

const telegramChat = async (env, { chatId, username, text, message_id }) => {
  const value = await env.conversations.get(chatId);
  const { conversationId, parentMessageId } = value ? JSON.parse(value) : {};

  const words = text.split(" ");
  let prompt = text;
  switch (words[0]) {
    case "/bc": {
      const phrase = words.slice(1).join(" ");
      // await broadcast(env, `_Broadcast message from Admin:_\n${phrase}`);
      await broadcast(env, phrase);
      return;
    }

    case "/feedback": {
      const phrase = words.slice(1).join(" ");
      await sendMessageToTelegram(
        env,
        env.ADMIN_CHAT_ID,
        `Feedback from ${username} (${chatId}):\n${phrase}`
      );
      return;
    }

    case "/tchat": {
      const receiverChatId = words[1];
      const phrase = words.slice(2).join(" ");
      await sendMessageToTelegram(
        env,
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

  if (chatId.toString() === env.ADMIN_CHAT_ID) {
    await jarvis(env, prompt);
  } else {
    const result = await chatGPT(env, prompt, {
      conversationId,
      parentMessageId,
    });

    await sendMessageToTelegram(env, chatId, result.text);

    if (!result.error) {
      await env.conversations.put(
        chatId,
        JSON.stringify({
          username,
          message_id,
          conversationId: result.conversationId,
          parentMessageId: result.id,
        })
      );
    } else {
      throw new Error(result.text);
    }
  }
};

const chatWrapped = async (env, message) => {
  const {
    chat: { id: chatId, username },
    text,
    message_id,
  } = message;

  try {
    await telegramChat(env, { chatId, username, text, message_id });
  } catch (err) {
    await sendMessageToTelegram(
      env,
      env.ADMIN_CHAT_ID,
      `Error on ${username} (${chatId}):\n${err.message}`
    );
  }
};

export default chatWrapped;
