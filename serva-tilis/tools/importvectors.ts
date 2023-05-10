import * as dotenv from "dotenv";
process.env = { ...process.env, ...dotenv.config().parsed };

import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
  RecursiveCharacterTextSplitter,
  TokenTextSplitter,
} from "langchain/text_splitter";
import * as fs from "fs";

import { GithubRepoLoader } from "langchain/document_loaders/web/github";

const loadDocument = async (namespace: string) => {
  // const loader = new GithubRepoLoader(
  //   "https://github.com/hwchase17/langchainjs",
  //   { branch: "main", recursive: false, unknown: "warn" }
  // );
  const text = fs.readFileSync("../tools/state_of_the_union.txt", "utf8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  // const splitter = new TokenTextSplitter({
  //   encodingName: "cl100k_base",
  // });

  // const docs = await loader.loadAndSplit(splitter);
  const docs = await splitter.createDocuments([text]);

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX as string);

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace,
  });

  return docs.length;
};

loadDocument("state-of-the-union").then((l) => {
  console.log(`Done importing ${l} documents !`);
  process.exit(0);
});
