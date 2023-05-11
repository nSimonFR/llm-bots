import { z } from "zod";

import {
  getAudioFromTelegram,
  sendChatActionToTelegram,
  sendMessageToTelegram,
} from "./out";
import transcribeAudioToText from "../../utils/speechtotext";

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
    text: z.string().optional(),
    voice: z
      .object({
        file_id: z.string(),
      })
      .optional(),
    entities: z.unknown(),
  }),
});

const checkAndParseTelegramMessage = async (json: unknown) => {
  const telegramMessage = await TelegramMessage.parseAsync(json);

  const id = telegramMessage.message.chat.id.toString();
  const name = telegramMessage.message.chat.username;

  let text;
  if (telegramMessage.message.voice) {
    sendChatActionToTelegram(id, "record_voice");
    const interval = setInterval(
      () => sendChatActionToTelegram(id, "record_voice"),
      5000
    );

    const audio = await getAudioFromTelegram(
      telegramMessage.message.voice.file_id
    );
    text = await transcribeAudioToText(audio, {
      encoding: "OGG_OPUS",
      sampleRateHertz: 48000,
      languageCode: "fr-FR",
      alternativeLanguageCodes: ["en-US", "fr-FR"],
    });

    sendMessageToTelegram(id, `_Transcript:_\n${text}`);

    clearInterval(interval);
  } else {
    text = telegramMessage.message.text;
  }

  sendChatActionToTelegram(id, "typing");
  setInterval(() => sendChatActionToTelegram(id, "typing"), 5000);

  const oncomplete = async (text: string) => {
    await sendMessageToTelegram(id, text);
  };

  return {
    id,
    name,
    text,
    oncomplete,
  };
};

export default checkAndParseTelegramMessage;
