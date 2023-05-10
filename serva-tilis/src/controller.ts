import mainAgent from "./agent/chat";
import qachain from "./agent/qachain";
import qaAgent from "./agent/qaagent";

export default async (
  id: string,
  username: string,
  text: string,
  reply: (text: string) => Promise<void>
) => {
  if (id.toString() !== process.env.ADMIN_CHAT_ID) {
    throw new Error("not_admin");
  }

  // const result = await mainAgent(user.name, text);
  const result = await qachain(username, text, "state-of-the-union");
  // const result = await qaagent(user.name, text);

  await reply(result);
};
