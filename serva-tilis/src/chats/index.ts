import checkAndParseTelegramMessage from "./telegram/in";

export type ChatMessage = {
  id: string;
  name: string;
  text: string;
};

const parseMessage = async (json: unknown): Promise<ChatMessage> => {
  // return Promise.any([
  return checkAndParseTelegramMessage(json);
  // TODO Add other message parsers here
  // ]);
};

export default parseMessage;
