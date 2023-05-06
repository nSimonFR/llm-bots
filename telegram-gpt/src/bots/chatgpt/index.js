import { ChatGPTUnofficialProxyAPI } from "@nsimon/chatgpt";

import { errorAndTimeoutWrapper } from "../../utils/commons";

const chatGPT = async (prompt, chatGPTSettings) => {
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: process.env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: process.env.OPENAI_PROXY_URL,
  });

  const result = await errorAndTimeoutWrapper(
    chatGPTAPI.sendMessage(prompt, chatGPTSettings)
  );

  return result;
};

export default chatGPT;
