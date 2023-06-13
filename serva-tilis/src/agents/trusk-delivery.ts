import { z } from "zod";
import { LLMChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

import type { BaseLanguageModel } from "langchain/dist/base_language";
import type { DataSource } from "typeorm";

import { metabaseDatasource } from "./sql";

const exampleIds = ["'a5CFea0DmA'", "'1361028824'", "'258449-34ZU1'"];

export const recoverDeliverySchema = z.object({
  question: z.string().describe("A very small question to ask the tool"),
  id: z
    .string()
    .describe(
      `An orderid or ordernumber. orderid is a uuid, ordernumber can be any string.` +
        `\n` +
        `Example inputs:` +
        exampleIds.join(" ") +
        `\n` +
        `If you do not have an identifier, DO NOT USE THIS TOOL.`
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

  /**
   * TODO
   * - flows
   * - onfleet_status
   */
  return `
Commande ${order.order_number} de ${
    order.customer_name
  } opérée par le Trusker ${order.driver_name || "(pas encore affectée)"}.

Information sur la commande:
Etat: ${order.onfleet_status /* TODO */}

Information de livraison:
${order.details}
`;
};

export type chainType = (input: recoverDeliverySchemaType) => Promise<string>;

const recoverDeliveryChain = async (
  llm: BaseLanguageModel
): Promise<chainType> => {
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
      if (
        !id ||
        !question ||
        !id.length ||
        !question.length ||
        exampleIds.includes(id)
      ) {
        throw new Error("invalid_params");
      }

      delivery = await getDelivery(dataSource, id);
    } catch (err) {
      console.error((err as Error).message);
      return (
        `Il nous semble impossible de retrouver votre commande - ` +
        `merci de preciser un numero d'identification.`
      );
    }

    const result = await chain.call({ delivery, question });
    return result.text;
  };
};

export default recoverDeliveryChain;
