import * as dotenv from "dotenv";
process.env = { ...process.env, ...dotenv.config().parsed };

import { telegramHelper } from "../src/chats/telegram/out";
import BOTS from "../src/agents";

const url = new URL("/telegram", process.env.PUBLIC_URL).href;

const refresh = async () => {
  await telegramHelper(`/setWebhook`, { url: "" });
  await telegramHelper(`/setWebhook`, { url });

  const commands = Object.keys(BOTS).map((b) => ({
    command: b,
    description: `Switch to ${b}`,
  }));
  commands.push({ command: "clear", description: "Clear conversation" });

  const result = await telegramHelper("/setMyCommands", { commands });
  console.log("/setMyCommands result:", result);

  return commands.length;
};

refresh().then((l) => {
  console.log(`Done refreshing bot with ${l} commands !`);
  process.exit(0);
});
