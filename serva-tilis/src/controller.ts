import { sendMessageToTelegram } from "./chats/telegram/out";
import BOTS from "./agents";

import type { cfEnvValue } from ".";
import type { ChatMessage } from "./chats";

const switchBotType = async (
  history: KVNamespace,
  id: string,
  botName: string
) => {
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

const treatMessage = async (
  history: KVNamespace,
  id: string,
  username: string,
  text: string
) => {
  const botName = await history.get(id);

  const bot = BOTS[botName as string] || BOTS.main;

  await bot(id, username, text);
};

export default async (message: ChatMessage) => {
  if (message.id.toString() !== process.env.ADMIN_CHAT_ID) {
    throw new Error("not_admin");
  }

  const history = process.env.history as cfEnvValue;

  if (message.text[0] === "/") {
    await switchBotType(
      history as KVNamespace,
      message.id,
      message.text.slice(1)
    );
  } else {
    await treatMessage(
      history as KVNamespace,
      message.id,
      message.name,
      message.text
    );
  }
};
