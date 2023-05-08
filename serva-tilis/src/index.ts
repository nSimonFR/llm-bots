import treatMessage from "./controller";

import TelegramMessage from "./chats/telegram/message";

const MyRes = (status: number, message: string) => {
  const finalMessage = `${status} - ${message}`;
  console.log(finalMessage);
  return new Response(finalMessage, { status });
};

export default {
  async fetch(
    request: Request,
    env: { [key: string]: string },
    ctx: ExecutionContext
  ): Promise<Response> {
    process.env = { ...process.env, ...env };

    if (request.method !== "POST") {
      return MyRes(405, "Method Not Allowed");
    }

    const json = await request.json().catch((e) => null);
    if (!json) {
      return MyRes(400, "Bad Request");
    }

    const telegramMessage = await TelegramMessage.parseAsync(json).catch((e) =>
      console.error(e)
    );
    if (!telegramMessage) {
      return MyRes(406, "Not Acceptable");
    }

    try {
      const {
        chat: { id: chatId, username },
        text,
      } = telegramMessage.message;

      await treatMessage({ id: chatId.toString(), name: username }, text);

      return MyRes(200, "OK");
    } catch (err) {
      const error = err as Error;
      const message = error.stack ? error.stack.toString() : error.message;
      // TODO Log error somewhere ?
      return MyRes(200, message);
    }
  },
};
