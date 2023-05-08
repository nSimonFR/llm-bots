import telegramChat from "./telegram";

export default {
  async fetch(request, env, context) {
    process.env = { ...process.env, ...env };

    if (request.method === "POST") {
      const payload = await request.json();
      if ("message" in payload) {
        context.waitUntil(telegramChat(payload.message));
      }
    }

    return new Response("Ok");
  },
};
