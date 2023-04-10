import { ChatGPTUnofficialProxyAPI } from "chatgpt";

import { errorAndTimeoutWrapper } from "../../../utils/commons";

export const generateText = async (env, prompt) => {
  // TODO Use separate memory buffer
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: env.OPENAI_PROXY_URL,
  });

  const result = await errorAndTimeoutWrapper(
    env,
    chatGPTAPI.sendMessage(prompt)
  );

  return result.text;
};

export default {
  name: "generate_text",
  description: `Generate Text: command_name: "generate_text", args: "prompt": "<prompt as text>"`,
  function: generateText,
};
