import { AgentExecutor } from "langchain/agents";
import { StructuredTool, DynamicStructuredTool } from "langchain/tools";
import { BufferWindowMemory } from "langchain/memory";
import { BaseChatMessageHistory } from "langchain/schema";

import type { BaseChain } from "langchain/chains";
import type { BaseLanguageModel } from "langchain/base_language";

import KVMessageHistory from "../utils/kvhistory";
import getModel from "../utils/model";
import { sendMessageToTelegram } from "../chats/telegram/out";
import recoverDeliveryChain, { recoverDeliverySchema } from "./trusk-delivery";
import MyAgent from "../utils/myagent";

export const agent = async (
  model: BaseLanguageModel,
  chatHistory?: BaseChatMessageHistory
): Promise<BaseChain> => {
  const recoverDelivery = await recoverDeliveryChain(model);

  const recoverOrderTool = new DynamicStructuredTool({
    name: "recover-order",
    description:
      `Can be used to answer questions about a Trusk order / delivery / command. ` +
      `If you do not have an identifier or ordernumber, DO NOT USE THIS TOOL ! ` +
      `Instead, use Final Answer to ask for an identifier, as such:
      \`\`\`json
      {
        "action": "Final Answer",
        "action_input": "Pourriez-vous me fournir votre identifiant de commande ou votre numéro de commande ?"
      }
      \`\`\``,
    returnDirect: true,
    schema: recoverDeliverySchema,
    func: recoverDelivery,
  });

  /*
  const [sqlChain, qaChain] = await Promise.all([
    sql(model),
    qa(model, "process"),
  ]);

  const sqlChainTool = new ChainTool({
    name: "Interrogate SQL",
    description: "Ask SQL information to Trusk Warehouse.",
    chain: sqlChain,
  });

  const qaChainTool = new ChainTool({
    name: "Interrogate Process",
    description: "Ask SQL information to Trusk Warehouse.",
    chain: qaChain,
  });
  */

  const tools: StructuredTool[] = [
    recoverOrderTool as StructuredTool,
    // sqlChainTool,
    // qaChainTool
  ];

  const executor = await AgentExecutor.fromAgentAndTools({
    agent: MyAgent.fromLLMAndTools(model, tools),
    tools,
    memory: new BufferWindowMemory({
      k: 5,
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
      chatHistory,
    }),
    returnIntermediateSteps: true,
  });

  return executor;
};

export default async (
  userId: string,
  username: string,
  input: string,
  kvStore: KVNamespace
) => {
  const model = getModel(username);

  const storeKey = `${userId}-trusk-memory`;
  const history = new KVMessageHistory(kvStore, storeKey);

  const executor = await agent(model, history);

  const result = await executor.call({ input });
  const text = result.output;

  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );
  console.log("final answer:", text);

  await sendMessageToTelegram(userId, text);
};
