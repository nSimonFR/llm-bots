import { z, ZodType } from "zod";

import {
  getAudioFromTelegram,
  sendChatActionToTelegram,
  sendMessageToTelegram,
} from "./out";
import transcribeAudioToText from "../../utils/speechtotext";

import { setImmediateInterval } from "../../utils/common";
import { specialCommands, treatMessage } from "../../bots";
import { MyRes } from "../..";

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

const checkAndParse = async (
  request: Request,
  waitUntil: ExecutionContext["waitUntil"],
  store: KVNamespace
): Promise<Response> => {
  if (request.method !== "POST") {
    return MyRes(405, "Method Not Allowed");
  }

  const json = await request.json().catch((e) => null);
  if (!json) {
    return MyRes(400, "Bad Request");
  }

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

  // TODO Remove:
  const ALLOWED_USERS = [process.env.ADMIN_CHAT_ID];
  if (!ALLOWED_USERS.includes(id.toString())) {
    throw new Error(`${id}_not_allowed`);
  }

  console.log(text);
  if (text[0] === "/") {
    await specialCommands(id, text.slice(1), store);
  } else {
    await treatMessage(id, name, text, store).catch((e) =>
      console.error(e.stack)
    );
  }

  return MyRes(200, "OK");
};

export default checkAndParse;
