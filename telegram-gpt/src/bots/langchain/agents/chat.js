import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  initializeAgentExecutorWithOptions,
  ZapierToolKit,
} from "langchain/agents";
import { SerpAPI, ZapierNLAWrapper } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { BufferWindowMemory } from "langchain/memory";

import KVHistory from "../kvhistory";

const GPTChain = async (model, input) => {
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

export default GPTChain;
