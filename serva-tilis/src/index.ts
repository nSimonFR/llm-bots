import discord from "./chats/discord/in";
import telegram from "./chats/telegram/in";

export const MyRes = (status: number, message: string) => {
  const finalMessage = `${status} - ${message}`;
  console.log(finalMessage);
  return new Response(finalMessage, { status });
};

const fetch = async (
  request: Request,
  env: { [key: string]: string | KVNamespace },
  ctx: ExecutionContext
): Promise<Response> => {
  // @ts-ignore
  process.env = { ...process.env, ...env };

  const path = new URL(request.url).pathname;
  switch (path) {
    case "/telegram":
      return telegram(request, ctx.waitUntil, env.history);

    case "/discord":
      return discord(request);

    default:
      return MyRes(400, "Unknown bot");
  }
};

export default { fetch };
