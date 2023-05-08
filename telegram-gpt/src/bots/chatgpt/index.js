import { ChatGPTUnofficialProxyAPI } from "@nsimon/chatgpt";

import { errorAndTimeoutWrapper } from "../../utils/commons";

const chatGPT = async (prompt, chatGPTSettings, isGPT4 = false) => {
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: process.env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: process.env.OPENAI_PROXY_URL,
    model: isGPT4 ? "gpt-4" : "text-davinci-002-render-sha",
  });

  const result = await errorAndTimeoutWrapper(
    chatGPTAPI.sendMessage(prompt, chatGPTSettings)
  );

  return result;
};

export default chatGPT;
