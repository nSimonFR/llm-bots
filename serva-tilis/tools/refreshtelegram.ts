import * as dotenv from "dotenv";
process.env = { ...process.env, ...dotenv.config().parsed };

import { telegramHelper } from "../src/chats/telegram/out";
import { BOTS } from "../src/controller";

const url = process.env.PUBLIC_URL as string;

const refresh = async () => {
  await telegramHelper(`/setWebhook`);

  await telegramHelper(
    `/setWebhook?${new URLSearchParams({
      url,
    })}`
  );

  const commands = Object.keys(BOTS).map((b) => ({
    command: b,
    description: `Switch to ${b}`,
  }));
  const formData = new FormData();
  formData.append("commands", JSON.stringify(commands));
  await telegramHelper("/setMyCommands", formData);
};

refresh().then(() => {
  console.log("Done refreshing bot !");
  process.exit(0);
});
