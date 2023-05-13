import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
  VectorStoreRouterToolkit,
  VectorStoreInfo,
  createVectorStoreRouterAgent,
} from "langchain/agents";
import type { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

import getModel from "../utils/model";
import { sendMessageToTelegram } from "../chats/telegram/out";

import type { BaseChain } from "langchain/chains";
import type { BaseLanguageModel } from "langchain/dist/base_language";

const getPineconeIndex = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  return client.Index(process.env.PINECONE_INDEX as string);
};

const getVector = async (
  pineconeIndex: VectorOperationsApi,
  namespace: string,
  description?: string
): Promise<VectorStoreInfo> => {
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );

  return {
    name: namespace,
    description: description || namespace,
    vectorStore,
  };
};

export const agent = async (model: BaseLanguageModel): Promise<BaseChain> => {
  const pineconeIndex = await getPineconeIndex();

  const vectors = await Promise.all([
    getVector(
      pineconeIndex,
      "hacker-news-lights",
      "What Lights the Universe’s Standard Candles ?"
    ),
    getVector(pineconeIndex, "github", "code, codebase, js, langchain"),
  ]);

  const toolkit = new VectorStoreRouterToolkit(vectors, model);
  const executor = createVectorStoreRouterAgent(model, toolkit);

  return executor;
};

export default async (userId: string, username: string, input: string) => {
  const model = getModel(username);

  const executor = await agent(model);
  const result = await executor.call({ input });

  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );

  const text = result.output;
  await sendMessageToTelegram(userId, text);
};
