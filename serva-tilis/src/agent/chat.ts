import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  initializeAgentExecutorWithOptions,
  ZapierToolKit,
} from "langchain/agents";
import { SerpAPI, Tool, ZapierNLAWrapper } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { BufferWindowMemory } from "langchain/memory";

import KVHistory from "./utils/kvhistory";
import getModel from "./utils/model";

export default async (userId: string, input: string) => {
  const model = getModel(userId);

  const embeddings = new OpenAIEmbeddings();

  // const zapier = new ZapierNLAWrapper();
  // const zapierToolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);

  // TODO Scope tools to user !
  const tools: Tool[] = [
    // new SerpAPI(process.env.SERPAPI_API_KEY, {
    //   location: "Paris, Ile-de-France, France",
    //   hl: "en",
    //   gl: "fr",
    // }),
    // new Calculator(),
    // new WebBrowser({
    //   model,
    //   embeddings,
    //   axiosConfig: { withCredentials: undefined },
    // }),
    // ...zapierToolkit.tools,
  ];

  const kvstore = process.env.history as unknown as KVNamespace;
  const memory = new BufferWindowMemory({
    k: 5,
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    chatHistory: new KVHistory(kvstore, userId),
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

  const result = await executor.call({ input });
  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );
  return result.output;
};
