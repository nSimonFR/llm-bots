import { sendAudioToTelegram } from "../../../utils/telegram";

export const generateAudio = async (env, prompt) => {
  // TODO Run in background ?
  // TODO Use separate memory buffer

  const voiceId = "ErXwobaYiN019PkySvjV";
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

export default {
  name: "generate_audio",
  description: `Generate Audio: command_name: "generate_audio", args: "prompt": "<prompt as text>"`,
  function: generateAudio,
};
