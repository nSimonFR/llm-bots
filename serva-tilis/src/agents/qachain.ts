import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
  BaseChain,
  ConversationalRetrievalQAChain,
  VectorDBQAChain,
} from "langchain/chains";

import { sendMessageToTelegram } from "../chats/telegram/out";
import getModel from "../utils/model";

import type { BaseLanguageModel } from "langchain/dist/base_language";

const getPineconeIndex = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  return client.Index(process.env.PINECONE_INDEX as string);
};

export const agent = async (
  model: BaseLanguageModel,
  namespace = "memory"
): Promise<BaseChain> => {
  const pineconeIndex = await getPineconeIndex();

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );

  // TODO test ?
  // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
  //   k: 5,
  //   returnSourceDocuments: true,
  // });

  return chain;
};

export default (namespace: string) =>
  async (userId: string, username: string, input: string) => {
    const model = getModel(username);

    const executor = await agent(model);

    const res = await executor.call({
      question: input,
      chat_history: [
        // TODO
      ],
    });

    const text = res.text;
    await sendMessageToTelegram(userId, text);
  };
