import { ChatGPTUnofficialProxyAPI } from "chatgpt";

import { timeoutP } from "../utils/commons";

const TIMEOUT = 120000;

const errorAndTimeoutWrapper = async (env, promise) => {
  const handleErrors = async (e) => {
    console.error(e);
    return {
      text: `ChatGPT error ${e.statusCode}: ${e.statusText}`,
      error: true,
    };
  };

  const res = await Promise.race([
    promise.catch(handleErrors),
    timeoutP(
      {
        text: `ChatGPT timeout error (${TIMEOUT}ms)`,
        error: true,
      },
      TIMEOUT
    ),
  ]);

  return res;
};

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
