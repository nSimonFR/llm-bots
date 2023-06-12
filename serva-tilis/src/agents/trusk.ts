import { z } from "zod";
import { LLMChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  initializeAgentExecutorWithOptions,
  ZapierToolKit,
} from "langchain/agents";
import {
  Tool,
  ZapierNLAWrapper,
  DynamicTool,
  ChainTool,
  StructuredTool,
  DynamicStructuredTool,
} from "langchain/tools";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { BufferWindowMemory } from "langchain/memory";
import { BaseChatMessageHistory, HumanChatMessage } from "langchain/schema";

import type { BaseChain } from "langchain/chains";
import type { BaseLanguageModel } from "langchain/dist/base_language";
import type { DataSource } from "typeorm";

import KVMessageHistory from "../utils/kvhistory";
import getModel from "../utils/model";
import { sendMessageToTelegram } from "../chats/telegram/out";
import { metabaseDatasource, agent as sql } from "./sql";
import { agent as qa } from "./qachain";

const recoverDeliverySchema = z.object({
  question: z.string().describe("A very small question to ask the tool"),
  id: z
    .string()
    .describe(
      `An orderid or ordernumber. orderid is a uuid, ordernumber can be any string.` +
        `Example inputs to this tool:` +
        `'a5CFeW0DmA'` +
        `'1361048824'` +
        `'258849-34ZU1'`
    ),
});
export type recoverDeliverySchemaType = z.infer<typeof recoverDeliverySchema>;

export const getDelivery = async (
  dataSource: DataSource,
  id: string
): Promise<string> => {
  const query = `
select *
from delivery
where order_number = '${id}' or log_order_id = '${id}' or order_id = '${id}'
  `;

  const orders = await dataSource.query(query);
  const order = orders[0];
  // console.log("order", order);

  if (!order) {
    throw new Error("unable_to_retrieve_delivery");
  }

  return `
  Commande ${order.order_number} de ${
    order.customer_name
  } opérée par le Trusker ${order.driver_name}.
  
  Information sur la commande:
  Etat: ${order.onfleet_status /* TODO */}
  
  Information de livraison:
${order.details}
`;
};

export const recoverDeliveryChain = async (
  llm: BaseLanguageModel
): Promise<(input: recoverDeliverySchemaType) => Promise<string>> => {
  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are a helpful assistant that answers questions about a delivery." +
        "Only reply with the smallest answer possible, don't make up anything. " +
        "Answer in a formal and informal friendly tone, adressing the user directly.\n\n" +
        `Example output for question "Quand est ma commande ?":\n` +
        `Votre commande [orderNumber] est prevue pour le DD/MM/YYYY entre HH:MM et HH:MM.`
    ),
    HumanMessagePromptTemplate.fromTemplate("{delivery}\n\n{question}"),
  ]);

  const chain = new LLMChain({ llm, prompt });
  const dataSource = await metabaseDatasource();

  return async ({ id, question }) => {
    let delivery;
    try {
      delivery = await getDelivery(dataSource, id);
    } catch (err) {
      return `Impossible de retrouver la commande pour l'identifiant ${id} - merci de preciser un autre numero d'identification.`;
    }

    const result = await chain.call({ delivery, question });
    return result.text;
  };
};

export const agent = async (
  model: BaseLanguageModel,
  chatHistory?: BaseChatMessageHistory
): Promise<BaseChain> => {
  const recoverDelivery = await recoverDeliveryChain(model);

  const recoverOrderTool = new DynamicStructuredTool({
    name: "recover-order",
    description:
      `Can be used to answer questions about a Trusk order / delivery / command. ` +
      `Always give this tool a JSON with id and question, like so: "{id: "a5CFeW0DmA", question: "Quel est l'etat de ma commande ?" }". ` +
      `If you do not have an identifier or ordernumber, use Final Answer to ask for an ordernumber.`,
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

  const executor = await initializeAgentExecutorWithOptions(
    [
      recoverOrderTool as StructuredTool,
      // sqlChainTool,
      // qaChainTool
    ],
    model,
    {
      agentType: "structured-chat-zero-shot-react-description",
      returnIntermediateSteps: true,
      memory: new BufferWindowMemory({
        k: 5,
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "input",
        outputKey: "output",
        chatHistory,
      }),
      callbacks: [
        {
          handleToolError(err) {
            console.error("Tool Error:", err);
          },
        },
      ],
    }
  );

  return executor;
};

export default async (userId: string, username: string, input: string) => {
  const model = getModel(username);

  const kvStore = process.env.history as unknown as KVNamespace;
  const storeKey = `${userId}-trusk-memory`;
  const history = new KVMessageHistory(kvStore, storeKey);

  const executor = await agent(model, history);

  const result = await executor.call({ input });
  console.log(
    "intermediateSteps:",
    result.intermediateSteps.map((s: any) => s.action.tool)
  );

  const text = result.output;
  await sendMessageToTelegram(userId, text);
};
