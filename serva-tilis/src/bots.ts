import { sendMessageToTelegram } from "./chats/telegram/out";
import BOTS from "./agents";

export const switchBotType = async (
  id: string,
  botName: string,
  history: KVNamespace
) => {
  let result: string;
  if (!BOTS[botName]) {
    const available = Object.keys(BOTS)
      .map((b) => "- `" + b + "`")
      .join("\n");

    result = `Unknown bot ${"`" + botName + "`"}, available:\n${available}`;
  } else {
    await history.put(id, botName);

    result = `Switched to ${"`" + botName + "`"}`;
  }

  await sendMessageToTelegram(id, result);
};

export const treatMessage = async (
  id: string,
  username: string,
  text: string,
  history: KVNamespace
) => {
  const botName = await history.get(id);

  const bot = BOTS[botName as string] || Object.values(BOTS)[0];

  await bot(id, username, text, history);
};
