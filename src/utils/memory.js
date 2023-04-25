import { PineconeClient } from "@pinecone-database/pinecone";

import { MODEL } from "./embeddings";

const pinecone = new PineconeClient();

const INDEX_NAME = "gpt-plus";
const NAMESPACE_NAME = "MEMORY";
const NEIGHBORS = 5;

const insert = (index) => async (id, values, metadata) => {
  if (!id) return;

  const vector = {
    id: id.toString(),
    values,
    metadata,
  };

  await index.upsert({
    upsertRequest: {
      vectors: [vector],
      namespace: NAMESPACE_NAME,
    },
  });
};

const query = (index) => async (vector, filter) => {
  const result = await index.query({
    queryRequest: {
      vector,
      filter,
      topK: NEIGHBORS,
      includeMetadata: true,
      namespace: NAMESPACE_NAME,
    },
  });

  // TODO Sort ?
  return result.matches;
};

const memory = async (env) => {
  await pinecone.init({
    environment: env.PINECONE_ENV,
    apiKey: env.PINECONE_API_KEY,
  });

  const indexes = await pinecone.listIndexes();
  if (!indexes.includes(INDEX_NAME)) {
    console.log(`Creating index ${INDEX_NAME}`);
    await pinecone.createIndex({
      createRequest: {
        name: INDEX_NAME,
        dimension: MODEL.dimension,
        metric: "cosine",
        pod_type: "p1",
      },
    });
  }

  const index = pinecone.Index(INDEX_NAME);
  return {
    insert: insert(index),
    query: query(index),
  };
};

export default memory;
