import { LLMChain } from "langchain";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

import getModel from "../utils/model";
import { sendMessageToTelegram } from "../chats/telegram/out";

import type { BaseChain } from "langchain/chains";
import type { BaseLanguageModel } from "langchain/dist/base_language";

export const agent = async (model: BaseLanguageModel): Promise<BaseChain> => {
  const translationPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are a helpful assistant that translates {input_language} to {output_language}.\n" +
        "Only reply with the original language translated, don't make up anything."
    ),
    HumanMessagePromptTemplate.fromTemplate("{text}"),
  ]);

  return new LLMChain({
    prompt: translationPrompt,
    llm: model,
  });
};

export default (from = "French", to = "English") =>
  async (userId: string, username: string, input: string) => {
    const model = getModel(username);

    const chain = await agent(model);

    const result = await chain.call({
      input_language: from,
      output_language: to,
      text: input,
    });

    const text = result.text;
    await sendMessageToTelegram(userId, text);
  };
