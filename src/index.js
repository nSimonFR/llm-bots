import telegramChat from "./telegramChat";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const payload = await request.json();
      if ("message" in payload) {
        await telegramChat(env, payload.message);
      }
    }
    // eslint-disable-next-line no-undef
    return new Response("Ok");
  },
};
