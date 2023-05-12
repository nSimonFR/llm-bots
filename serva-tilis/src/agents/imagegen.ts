import { sendPhotoToTelegram } from "../chats/telegram/out";
import { generateWithHuggingFace, refinePrompt } from "../utils/image";
import { generatePermutations } from "../utils/array";

const generateImage =
  (model: string) =>
  async (username: string, prompt: string, chatId: string) => {
    const upr = await refinePrompt(prompt).catch((e) => console.warn(e));
    const updatedPrompt = generatePermutations(upr || prompt, 1)[0];

    const image = await generateWithHuggingFace(model)(updatedPrompt);

    await sendPhotoToTelegram(chatId, image, updatedPrompt);

    return `_Generated image with prompt:_\n${updatedPrompt}`;
  };

export default generateImage;
