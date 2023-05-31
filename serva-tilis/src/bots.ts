import { sendMessageToTelegram } from "./chats/telegram/out";
import BOTS from "./agents";

export const switchBotType = async (id: string, botName: string) => {
  const history = process.env.history as unknown as KVNamespace;

  if (!BOTS[botName]) {
    const available = Object.keys(BOTS)
      .map((b) => "- `" + b + "`")
      .join("\n");
    return `Unknown bot ${"`" + botName + "`"}, available:\n${available}`;
  }

  await history.put(id, botName);
  const result = `Switched to ${"`" + botName + "`"}`;

  await sendMessageToTelegram(id, result);
};

export const treatMessage = async (
  id: string,
  username: string,
  text: string
) => {
  const history = process.env.history as unknown as KVNamespace;

  const botName = await history.get(id);

  const bot = BOTS[botName as string] || Object.values(BOTS)[0];

  console.log("STARTING BOT");
  await bot(id, username, text);
};
