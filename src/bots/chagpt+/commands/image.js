import { timeoutP } from "../../../utils/commons";
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

  return json.data[0].url;
};

const generateWithMidjourney = async (env, prompt) => {
  const POLLING_RATE = 500;
  const baseUrl = "https://replicate.com/api";
  const finalStatuses = ["canceled", "succeeded", "failed"];

  const model =
    "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb";
  const [path, version] = model.split(":");

  const postUrl = `/models/${path}/versions/${version}/predictions`;
  const postRes = await fetch(baseUrl + postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: { prompt },
    }),
  });

  let prediction = await postRes.json();

  /* eslint-disable no-await-in-loop */
  while (!finalStatuses.includes(prediction.status)) {
    await timeoutP(POLLING_RATE);

    const getUrl = `/models${prediction.version.model.absolute_url}/versions/${prediction.version_id}/predictions/${prediction.uuid}`;
    const response = await fetch(baseUrl + getUrl);
    const result = await response.json();

    prediction = result.prediction;
  }
  /* eslint-enable no-await-in-loop */

  return prediction.output;
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
