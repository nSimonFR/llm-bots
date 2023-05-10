import telegramChat from "./telegram";
import { sendChatActionToTelegram } from "./utils/telegram";

export default {
  async fetch(request, env, context) {
    process.env = { ...process.env, ...env };

    if (request.method === "POST") {
      const payload = await request.json();
      if ("message" in payload) {
        context.waitUntil(
          sendChatActionToTelegram(payload.message.chat.id, "typing")
        );
        context.waitUntil(telegramChat(payload.message));
      }
    }

    return new Response("Ok");
  },
};
