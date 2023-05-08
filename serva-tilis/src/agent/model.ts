import { ChatOpenAI } from "langchain/chat_models/openai";

export default (userId: string) =>
  new ChatOpenAI(
    {
      temperature: 0,
      callbacks: [
        {
          handleLLMError(err: any) {
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
          "Helicone-User-Id": userId,
          "Helicone-Retry-Enabled": true,
          "Helicone-Cache-Enabled": true,
          "Helicone-RateLimit-Policy": "100;w=60;s=user",
        },
      },
    }
  );
