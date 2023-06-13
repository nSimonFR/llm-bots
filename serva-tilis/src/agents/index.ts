import main from "./chat";
import qaChain from "./qachain";
import qaAgent from "./qaagent";
import imageGen from "./imagegen";
import translation from "./translation";
import sql from "./sql";
import trusk from "./trusk";

type Bot = (
  username: string,
  text: string,
  chatId: string,
  kvStore: KVNamespace
) => Promise<void>;

const BOTS: Record<string, Bot> = {
  main,
  sql,
  trusk,
  translation: translation(),
  qa_union: qaChain("state-of-the-union"),
  qa_multi: qaAgent,
  img_openjourney_v4: imageGen("prompthero/openjourney-v4"),
  img_stablediffusion_v1_4: imageGen("CompVis/stable-diffusion-v1-4"),
  img_stablediffusion_v2_1: imageGen("stabilityai/stable-diffusion-2-1"),
};

export default BOTS;
