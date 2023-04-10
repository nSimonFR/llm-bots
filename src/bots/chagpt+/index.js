import { ChatGPTUnofficialProxyAPI } from "chatgpt";

import { errorAndTimeoutWrapper } from "../../utils/commons";

import commands from "./commands";
import init from "./messages/init";

const chatGPTPlus = async (env, prompt, username, chatGPTSettings) => {
  const chatGPTAPI = new ChatGPTUnofficialProxyAPI({
    accessToken: env.OPENAI_ACCESS_TOKEN,
    apiReverseProxyUrl: env.OPENAI_PROXY_URL,
  });

  const name = "ChatGPT+";
  const role = `You are talking to me using only JSON, and my name is ${username}.`; // You are interested in my life. You behave like a chill friend would. You are always there to listen, have fun and help me feel good and help me achieve my goals. You make jokes when appropriate, use emoji's sometimes, you have conversations like normal person. Sometimes you ask a question as well, you keep conversation natural.`;
  const goals = prompt.split("\n");
  const updatedPrompt = init(
    name,
    role,
    goals,
    Object.values(commands).map((d) => d.description)
  );

  const result = await errorAndTimeoutWrapper(
    env,
    chatGPTAPI.sendMessage(updatedPrompt, chatGPTSettings)
  );

  // TODO Handle unparseable result
  const command = JSON.parse(result.text);
  console.log(command);

  const foundCommand = Object.values(commands).find(
    (v) => v.name === command.command_name
  );
  if (!foundCommand) {
    throw new Error(`Unkown command: ${command.command_name}`);
  }

  result.text = await foundCommand.function(env, command.args.prompt);

  return result;
};

export default chatGPTPlus;
