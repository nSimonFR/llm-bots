import memoryModule from "../../utils/memory";
import getEmbedding from "../../utils/embeddings";

import memoryInit from "./messages/memory/init";
import commandsInit from "./messages/commands/init";
import commands from "./commands";
import chatGPT from "../chatgpt";

const commandModule = async (text) => {
  let command;
  try {
    command = JSON.parse(text);
  } catch (err) {
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");
    const jsonString = text.slice(startIndex, endIndex + 1);
    command = JSON.parse(jsonString);
  }
  console.log(command);

  const foundCommand = Object.values(commands).find(
    (v) => v.name === command.command_name
  );
  if (!foundCommand) {
    throw new Error(`Unkown command: ${command.command_name}`);
  }

  return foundCommand.function(command.args);
};

const BOTNAME = "ChatGPT+";

const chatGPTPlus = async (
  prompt,
  username,
  messageId,
  lastMessage,
  chatGPTSettings,
  COMMAND = true,
  MEMORY = false
) => {
  const mem = await memoryModule();
  const embedding = await getEmbedding(prompt);
  const memories = await mem.query(embedding, { username });
  const memory = MEMORY
    ? memories
        .map(
          (m) =>
            `${m.metadata.username}: ${m.metadata.prompt}` +
            "\n" +
            `${BOTNAME}: ${m.metadata.result}`
        )
        .join("\n")
    : [];

  const initMessage = COMMAND ? commandsInit : memoryInit;
  const updatedPrompt = await initMessage(
    BOTNAME,
    username,
    prompt,
    memory,
    lastMessage
  );
  // console.log(updatedPrompt);

  const result = await chatGPT(updatedPrompt, chatGPTSettings);

  if (COMMAND) {
    try {
      result.text = await commandModule(result.text);
    } catch (err) {
      console.error("ChatGPT+ error (to retry)", err.message);
      // Re-prompt in hopes it does not loop eternally :p
      return chatGPTPlus(prompt, username, chatGPTSettings);
    }
  }

  await mem.insert(messageId, embedding, {
    prompt,
    result: result.text,
    username,
  });

  return result;
};

export default chatGPTPlus;
