import { ChatOpenAI } from "langchain/chat_models/openai";

import ChatAgent from "./agents/chat";
import SQLAgent from "./agents/sql";

const getModel = () =>
  new ChatOpenAI(
    {
      temperature: 0,
      callbacks: [
        // {
        //   handleLLMStart(llm, prompts) {
        //     console.log(`Prompts:`, prompts[0]);
        //   },
        // },
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
    },
    {
      basePath: "https://oai.hconeai.com/v1",
      baseOptions: {
        headers: {
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          // TODO Helicone-User-Id
        },
      },
    }
  );

export const GPTChain = (input) => ChatAgent(getModel(), input);
export const GPTSQL = (input) => SQLAgent(getModel(), input);
