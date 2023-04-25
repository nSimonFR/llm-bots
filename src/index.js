import telegramChat from "./telegram";

export default {
  async fetch(request, env) {
    process.env = { ...process.env, ...env };
    if (request.method === "POST") {
      const payload = await request.json();
      if ("message" in payload) {
        await telegramChat(payload.message);
      }
    }
    // eslint-disable-next-line no-undef
    return new Response("Ok");
  },
};
