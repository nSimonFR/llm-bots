import { ChatGPTUnofficialProxyAPI } from "chatgpt";

import { errorAndTimeoutWrapper } from "../../utils/commons";

import commands from "./commands";
import init from "./messages/init";

const chatGPTPlus = async (env, prompt, username, chatGPTSettings) => {
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: env.OPENAI_PROXY_URL,
  });

  // TODO change main conv
  const updatedPrompt = init(username, prompt);

  const result = await errorAndTimeoutWrapper(
    env,
    chatGPTAPI.sendMessage(updatedPrompt, chatGPTSettings)
  );

  let command;
  try {
    command = JSON.parse(result.text);
  } catch (err) {
    // Re-prompt in hopes it does not loop eternally :p
    return chatGPTPlus(env, prompt, username, chatGPTSettings);
  }
  console.log(command);

  const foundCommand = Object.values(commands).find(
    (v) => v.name === command.command_name
  );
  if (!foundCommand) {
    throw new Error(`Unkown command: ${command.command_name}`);
  }

  result.text = await foundCommand.function(env, command.args);

  return result;
};

export default chatGPTPlus;
