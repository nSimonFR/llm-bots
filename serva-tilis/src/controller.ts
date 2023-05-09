import mainAgent from "./agent/chat";
import qachain from "./agent/qachain";

import { sendMessageToTelegram } from "./chats/telegram/out";

export default async (
  user: {
    id: string;
    name: string;
  },
  text: string
) => {
  // const result = await mainAgent(user.name, text);
  const result = await qachain(user.name, text);

  await sendMessageToTelegram(user.id, result);
};
