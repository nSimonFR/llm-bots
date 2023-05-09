import mainAgent from "./agent/chat";
import qachain from "./agent/qachain";
import qaAgent from "./agent/qaagent";

import { sendMessageToTelegram } from "./chats/telegram/out";

export default async (
  user: {
    id: string;
    name: string;
  },
  text: string
) => {
  // const result = await mainAgent(user.name, text);
  const result = await qachain(user.name, text, "default");
  // const result = await qaagent(user.name, text);

  await sendMessageToTelegram(user.id, result);
};
