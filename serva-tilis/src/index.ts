import treatMessage from "./controller";

import checkAndParseTelegramMessage from "./chats/telegram/in";

export type ChatMessage = {
  id: string;
  name: string;
  text: string;
  oncomplete: (text: string) => Promise<void>;
};

const MyRes = (status: number, message: string) => {
  const finalMessage = `${status} - ${message}`;
  console.log(finalMessage);
  return new Response(finalMessage, { status });
};

const parseMessage = async (json: unknown): Promise<ChatMessage> =>
  Promise.any([
    checkAndParseTelegramMessage(json),
    // TODO Add other message types here
  ]);

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

    const message: ChatMessage | null = await parseMessage(json).catch(
      (e) => null
    );
    if (!message) {
      return MyRes(406, "Not Acceptable");
    }

    ctx.waitUntil(
      treatMessage(message.id, message.name, message.text, message.oncomplete)
    );

    return MyRes(200, "OK");
  },
};
