import { timeoutP } from "./commons";

const getEmbeddingFree = (modelId) => async (text) => {
  const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
    },
    body: JSON.stringify({
      inputs: [text],
      options: { wait_for_model: true },
    }),
  });

  const json = await response.json();
  if (json.error) {
    console.log(json);
    await timeoutP(1000);
    return getEmbeddingFree(modelId)(text);
  }
  return json[0];
};

const getEmbeddingOpenAI = (model) => async (input) => {
  const url = `https://api.openai.com/v1/embeddings`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input,
      model,
    }),
  });

  const json = await response.json();
  if (json.error) {
    throw new Error(`OpenAI Embeddings Error: ${JSON.stringify(json.error)}`);
  }
  return json.data[0].embedding;
};

const MODELS = {
  "all-roberta-large-v1": {
    function: getEmbeddingFree("sentence-transformers/all-roberta-large-v1"),
    dimension: 1024,
  },
  "all-MiniLM-L6-v2": {
    function: getEmbeddingFree("sentence-transformers/all-MiniLM-L6-v2"),
    dimension: 384,
  },
  "text-embedding-ada-002": {
    function: getEmbeddingOpenAI("text-embedding-ada-002"),
    dimension: 1536,
  },
};

export const MODEL = MODELS["text-embedding-ada-002"];
export default MODEL.function;
