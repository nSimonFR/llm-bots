import { z } from "zod";

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

export default TelegramMessage;
