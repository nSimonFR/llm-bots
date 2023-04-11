import midjourney from "midjourney-client";

import { sendPhotoToTelegram } from "../../../utils/telegram";

const generateWithStableDiffusion = async (env, prompt) => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    }
  );
  console.log(prompt);

  const image = await response.blob();

  return image;
};

const generateWithDALL_E = async (env, prompt) => {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "256x256",
    }),
  });

  const json = await response.json();
  const image = json.data[0].url;

  return image;
};

const generateWithMidjourney = async (env, prompt) => {
  const result = await midjourney(prompt, { width: 1024 });

  const image = result[0];

  return image;
};

const ENGINES = {
  stable_diffusion: generateWithStableDiffusion,
  dall_e: generateWithDALL_E,
  midjourney: generateWithMidjourney,
};
const DEFAULT = "midjourney";
ENGINES.default = ENGINES[DEFAULT];

export const generateImage = async (env, { prompt, engine }) => {
  // TODO Run in background ?
  const generationMethod = ENGINES[engine];
  if (!generationMethod) {
    console.error(`Cannot find engine ${engine} - restarting with ${DEFAULT}`);
    return generateImage(env, { prompt, engine: DEFAULT });
  }

  const image = await generationMethod(env, prompt);

  await sendPhotoToTelegram(env, env.ADMIN_CHAT_ID, image);

  return `__Generated image with ${engine} of:__\n${prompt} !`;
};

const settings = {
  command_name: "generate_audio",
  args: { prompt: "<text>", engine: Object.keys(ENGINES).join(`|`) },
};

export default {
  name: "generate_image",
  settings,
  function: generateImage,
};
