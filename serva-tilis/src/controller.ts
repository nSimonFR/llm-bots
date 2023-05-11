import mainAgent from "./agents/chat";
import qaChain from "./agents/qachain";
import qaAgent from "./agents/qaagent";
import type { cfEnvValue } from ".";

type Bot = (username: string, text: string) => Promise<string>;

export const BOTS: Record<string, Bot> = {
  main: mainAgent,
  qa: qaAgent,
  union: qaChain("state-of-the-union"),
};

const switchBotType = async (
  history: KVNamespace,
  id: string,
  botName: string
) => {
  if (!BOTS[botName]) {
    // Trick to make join work on first line;
    const available = Object.keys(BOTS)
      .map((b) => "- `" + b + "`")
      .join("\n");
    return `Unknown bot ${botName}, available:${available}`;
  }

  await history.put(id, botName);
  return `Switched to ${botName}`;
};

const treatMessage = async (
  history: KVNamespace,
  id: string,
  username: string,
  text: string
) => {
  const botName = await history.get(id);

  const bot = BOTS[botName as string] || BOTS.main;

  return await bot(username, text);
};

export default async (
  id: string,
  username: string,
  text: string,
  reply: (text: string) => Promise<void>
) => {
  if (id.toString() !== process.env.ADMIN_CHAT_ID) {
    throw new Error("not_admin");
  }

  const history = process.env.history as cfEnvValue;

  const result = await (text[0] === "/"
    ? switchBotType(history as KVNamespace, id, text.slice(1))
    : treatMessage(history as KVNamespace, id, username, text));

  await reply(result);
};
