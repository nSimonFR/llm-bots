import { sendPhotoToTelegram } from "../chats/telegram/out";
import { generateWithHuggingFace, refinePrompt } from "../utils/image";

const generateImage = async (chatId: string, prompt: string) => {
  // const model = "CompVis/stable-diffusion-v1-4";
  // const model = "stabilityai/stable-diffusion-2-1";
  const model = "prompthero/openjourney-v4";

  const updatedPrompt = await refinePrompt(prompt);
  const image = await generateWithHuggingFace(model)(prompt);

  // TODO
  await sendPhotoToTelegram(chatId, image);

  return `_Generated image with prompt:_\n${updatedPrompt}`;
};

export default generateImage;
