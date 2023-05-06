import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  initializeAgentExecutorWithOptions,
  ZapierToolKit,
  createSqlAgent,
  SqlToolkit,
} from "langchain/agents";
import { SerpAPI, ZapierNLAWrapper } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { BufferWindowMemory } from "langchain/memory";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";

import KVHistory from "./kvhistory";

const getModel = () =>
  new ChatOpenAI({
    temperature: 0,
    callbacks: [
      {
        handleLLMStart(llm, prompts) {
          console.log(`Prompts:`, prompts[0]);
        },
      },
      {
        handleLLMEnd(out) {
          console.log(
            `LLM result (${out.llmOutput.tokenUsage.totalTokens}):\n${out.generations[0][0].text}`
          );
        },
      },
      {
        handleLLMError(err) {
          console.error("LLM error:", err.response.data.error.message);
        },
      },
    ],
  });

export const GPTChain = async (input) => {
  const model = getModel();
  const embeddings = new OpenAIEmbeddings();

  const zapier = new ZapierNLAWrapper();
  const zapierToolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);

  // TODO Scope tools to user !
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Paris, Ile-de-France, France",
      hl: "en",
      gl: "fr",
    }),
    new Calculator(),
    new WebBrowser({
      model,
      embeddings,
      axiosConfig: { withCredentials: undefined },
    }),
    ...zapierToolkit.tools,
  ];

  const memory = new BufferWindowMemory({
    k: 5,
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    chatHistory: new KVHistory(process.env.conversations, "MEMORYSTORAGE"),
  });

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-conversational-react-description",
    returnIntermediateSteps: true,
    memory,
    callbacks: [
      {
        handleToolError(err) {
          console.error("Tool Error:", err);
        },
      },
    ],
    // verbose: true,
  });

  const result = await executor.call({ input });
  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s) => s.action.tool)
  );
  return result.output;
};

export const GPTSQL = async (input) => {
  console.log("QUERY:", input);

  const model = getModel();

  const datasource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
    sampleRowsInTableInfo: 1,
  });
  const toolkit = new SqlToolkit(db);
  const executor = createSqlAgent(model, toolkit, {
    // verbose: true,
  });

  const result = await executor.call({ input });
  return [
    "SQL Queries ran:",
    ...result.intermediateSteps
      .filter((s) => s.action.tool === "query-sql")
      .map((s) => s.action.toolInput),
    "Final Result:",
    result.output,
  ].join("\n");
};
