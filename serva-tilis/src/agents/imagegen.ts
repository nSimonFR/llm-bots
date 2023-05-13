import { sendPhotoToTelegram } from "../chats/telegram/out";
import { generateWithHuggingFace, refinePrompt } from "../utils/image";
import { generatePermutations } from "../utils/array";

const generateImage =
  (model: string) =>
  async (userId: string, username: string, input: string) => {
    // TODO add translation
    const prompt = await refinePrompt(input).catch((e) => console.warn(e));
    const updatedPrompt = generatePermutations(prompt || input, 1)[0];

    const image = await generateWithHuggingFace(model)(updatedPrompt);

    await sendPhotoToTelegram(input, image, updatedPrompt);
  };

export default generateImage;
