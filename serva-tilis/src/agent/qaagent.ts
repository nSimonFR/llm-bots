import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
  VectorStoreRouterToolkit,
  VectorStoreInfo,
  createVectorStoreRouterAgent,
} from "langchain/agents";
import type { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

import getModel from "./model";

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

export default async (userId: string, input: string) => {
  const model = getModel(userId);

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
  const agent = createVectorStoreRouterAgent(model, toolkit);

  const result = await agent.call({ input });

  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );
  return result.output;
};
