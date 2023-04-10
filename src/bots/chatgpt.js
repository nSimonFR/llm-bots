import { ChatGPTUnofficialProxyAPI } from "chatgpt";

import { errorAndTimeoutWrapper } from "../utils/commons";

const chatGPT = async (env, prompt, chatGPTSettings) => {
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: env.OPENAI_PROXY_URL,
  });

  const result = await errorAndTimeoutWrapper(
    env,
    chatGPTAPI.sendMessage(prompt, chatGPTSettings)
  );

  return result;
};

export default chatGPT;
