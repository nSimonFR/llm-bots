import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
  ConversationalRetrievalQAChain,
  VectorDBQAChain,
} from "langchain/chains";

import getModel from "./utils/model";

const getPineconeIndex = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  return client.Index(process.env.PINECONE_INDEX as string);
};

export default (namespace: string) => async (userId: string, input: string) => {
  const model = getModel(userId);

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

  const res = await chain.call({
    question: input,
    chat_history: [
      // TODO
    ],
  });

  return res.text;
};
