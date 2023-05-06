import { timeoutP } from "../../../utils/commons";
import { sendPhotoToTelegram } from "../../../utils/telegram";

const generateWithStableDiffusion = async (prompt) => {
  const baseResponse = await fetch(
    "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Stable-Diffusion",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    }
  );

  const promptJson = await baseResponse.json();
  const inputs = promptJson[0].generated_text;

  const model = "CompVis/stable-diffusion-v1-4";
  // const model = "stabilityai/stable-diffusion-2-1";

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs,
      }),
    }
  );

  const image = await response.blob();

  return [inputs, image];
};

const generateWithDALL_E = async (inputs) => {
  const baseResponse = await fetch(
    "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Dalle",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs,
      }),
    }
  );

  const promptJson = await baseResponse.json();
  const prompt = promptJson[0].generated_text;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "512x512",
    }),
  });

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message);
  }

  const image = json.data[0].url;
  return [prompt, image];
};

export const generateWithMidjourney = async (prompt) => {
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
      Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: { prompt },
    }),
  });

  console.log(await postRes.clone().text());
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

  return [prompt, prediction.output];
};

const ENGINES = {
  stablediffusion: generateWithStableDiffusion,
  dalle: generateWithDALL_E,
  // midjourney: generateWithMidjourney,
  undefined,
};
const DEFAULT = "stablediffusion";

export const generateImage = async ({ prompt, engine }) => {
  // TODO Run in background ?
  const generationMethod = ENGINES[engine];
  if (!generationMethod) {
    console.error(`Cannot find engine ${engine} - restarting with ${DEFAULT}`);
    return generateImage({ prompt, engine: DEFAULT });
  }

  const [updatedPrompt, image] = await generationMethod(prompt);

  await sendPhotoToTelegram(process.env.ADMIN_CHAT_ID, image);

  return `*Generated image with ${engine};*\n${updatedPrompt}`;
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
