import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  initializeAgentExecutorWithOptions,
  ZapierToolKit,
} from "langchain/agents";
import { SerpAPI, Tool, ZapierNLAWrapper } from "langchain/tools";
import { WebBrowser } from "langchain/tools/webbrowser";
import { BufferWindowMemory } from "langchain/memory";

import KVHistory from "../utils/kvhistory";
import getModel from "../utils/model";
import { sendMessageToTelegram } from "../chats/telegram/out";

import type { BaseChain } from "langchain/chains";
import type { BaseLanguageModel } from "langchain/dist/base_language";

export const agent = async (
  model: BaseLanguageModel,
  storeKey = "memory"
): Promise<BaseChain> => {
  const embeddings = new OpenAIEmbeddings();

  // const zapier = new ZapierNLAWrapper();
  // const zapierToolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);

  // TODO Scope tools to user !
  const tools: Tool[] = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Paris, Ile-de-France, France",
      hl: "en",
      gl: "fr",
    }),
    // new Calculator(),
    new WebBrowser({
      model,
      embeddings,
      axiosConfig: { withCredentials: undefined },
    }),
    // ...zapierToolkit.tools,
  ];

  const kvstore = process.env.history as unknown;
  const memory = new BufferWindowMemory({
    k: 5,
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    chatHistory: new KVHistory(kvstore as KVNamespace, storeKey),
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
  });

  return executor;
};

export default async (userId: string, username: string, input: string) => {
  const model = getModel(username);
  const storeKey = `${userId}-memory`;
  const executor = await agent(model, storeKey);

  const result = await executor.call({ input });
  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );

  const text = result.output;
  await sendMessageToTelegram(userId, text);
};
