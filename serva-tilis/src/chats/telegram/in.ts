import { z, ZodType } from "zod";

import {
  getAudioFromTelegram,
  sendChatActionToTelegram,
  sendMessageToTelegram,
} from "./out";
import transcribeAudioToText from "../../utils/speechtotext";

import type { ChatMessage } from "..";
import { setImmediateInterval } from "../../utils/common";

//#region Types
const baseMessage = z.object({
  message_id: z.number(),
  chat: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

const TelegramText = z.object({
  message: baseMessage.extend({
    text: z.string(),
  }),
});
type TelegramText = z.infer<typeof TelegramText>;

const TelegramAudio = z.object({
  message: baseMessage.extend({
    voice: z.object({
      file_id: z.string(),
    }),
  }),
});
type TelegramAudio = z.infer<typeof TelegramAudio>;

const TelegramMessage = z.union([TelegramText, TelegramAudio]);

const isOfType = <T>(element: T, type: ZodType) =>
  type.safeParse(element).success;
//#endregion

const REFRESH_STATUS_INTERVAL = 4500;

const convertAudio = async (telegramMessage: TelegramAudio) => {
  const id = telegramMessage.message.chat.id.toString();

  const interval = setImmediateInterval(
    () => sendChatActionToTelegram(id, "record_voice"),
    REFRESH_STATUS_INTERVAL
  );

  const audio = await getAudioFromTelegram(
    telegramMessage.message.voice.file_id
  );
  const text = await transcribeAudioToText(audio, {
    encoding: "OGG_OPUS",
    sampleRateHertz: 48000,
    languageCode: "fr-FR",
    alternativeLanguageCodes: ["en-US", "fr-FR"],
  });

  sendMessageToTelegram(
    id,
    `_Transcript:_${text}`,
    telegramMessage.message.message_id.toString()
  );
  clearInterval(interval);

  return text;
};

const checkAndParseTelegramMessage = async (
  json: unknown
): Promise<ChatMessage> => {
  const telegramMessage = await TelegramMessage.parseAsync(json);

  const id = telegramMessage.message.chat.id.toString();
  const name = telegramMessage.message.chat.username;

  const text = isOfType(telegramMessage, TelegramAudio)
    ? await convertAudio(telegramMessage as TelegramAudio)
    : (telegramMessage as TelegramText).message.text;

  setImmediateInterval(
    () => sendChatActionToTelegram(id, "typing"),
    REFRESH_STATUS_INTERVAL
  );

  return {
    id,
    name,
    text,
  };
};

export default checkAndParseTelegramMessage;
