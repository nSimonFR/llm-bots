import * as dotenv from "dotenv";
process.env = { ...process.env, ...dotenv.config().parsed };

import { PineconeClient } from "@pinecone-database/pinecone";

const dropNamespace = async (namespace: string) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENV as string,
  });
  const index = client.Index(process.env.PINECONE_INDEX as string);

  await index.delete1({ deleteAll: true, namespace });
};

const namespace = process.argv[2];
if (namespace) {
  dropNamespace(namespace).then(() => {
    console.log("Done !");
    process.exit(0);
  });
}
