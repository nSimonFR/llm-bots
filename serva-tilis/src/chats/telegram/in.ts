import { z } from "zod";

import { sendChatActionToTelegram, sendMessageToTelegram } from "./out";

const TelegramMessage = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      last_name: z.string(),
      username: z.string(),
      language_code: z.string(),
    }),
    chat: z.object({
      id: z.number(),
      first_name: z.string(),
      last_name: z.string(),
      username: z.string(),
      type: z.string(),
    }),
    date: z.number(),
    text: z.string(),
    entities: z.unknown(),
  }),
});

const checkAndParseTelegramMessage = async (json: unknown) => {
  const telegramMessage = await TelegramMessage.parseAsync(json);

  const id = telegramMessage.message.chat.id.toString();
  const name = telegramMessage.message.chat.username;
  const text = telegramMessage.message.text;

  const oncomplete = async (text: string) => {
    await sendMessageToTelegram(id, text);
  };

  await sendChatActionToTelegram(id, "typing");

  return {
    id,
    name,
    text,
    oncomplete,
  };
};

export default checkAndParseTelegramMessage;
