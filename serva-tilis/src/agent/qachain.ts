import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";

import getModel from "./model";

const getPineconeIndex = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  return client.Index(process.env.PINECONE_INDEX as string);
};

export default async (userId: string, input: string) => {
  const model = getModel(userId);

  const pineconeIndex = await getPineconeIndex();

  const namespace = "github";
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  const res = await chain.call({
    question: input,
    chat_history: [
      // TODO
    ],
  });

  return res.text;
};
