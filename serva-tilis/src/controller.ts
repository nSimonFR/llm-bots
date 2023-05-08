import mainAgent from "./agent/chat";
import { sendMessageToTelegram } from "./chats/telegram/out";

export default async (
  user: {
    id: string;
    name: string;
  },
  text: string
) => {
  const result = await mainAgent(user.name, text);

  await sendMessageToTelegram(user.id, result);
};
