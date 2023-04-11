import { sendAudioToTelegram } from "../../../utils/telegram";

const VOICES = {
  male: "ErXwobaYiN019PkySvjV",
  female: "EXAVITQu4vr4xnSDxMaL",
};
const DEFAULT = "male";

export const generateAudio = async (env, { prompt, voice }) => {
  // TODO Run in background ?
  // TODO Use separate memory buffer

  let voiceId = VOICES[voice];
  if (!voiceId) {
    console.error(`Cannot find motor ${voice} - defaulting to ${DEFAULT}`);
    voiceId = VOICES[DEFAULT];
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": env.ELEVEN_LABS_API_KEY,
    },
    body: JSON.stringify({
      text: prompt,
    }),
  });

  const audio = await response.blob();
  await sendAudioToTelegram(env, env.ADMIN_CHAT_ID, audio);

  return `__Generated audio ! Transcript:__\n${prompt}`;
};

const settings = {
  command_name: "generate_audio",
  args: { prompt: "<text>", voice: Object.keys(VOICES).join(`|`) },
};

export default {
  name: "generate_audio",
  settings,
  function: generateAudio,
};
