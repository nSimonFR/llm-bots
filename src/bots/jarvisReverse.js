import { sendKey } from "../utils/huggingface-ws";

import { timeoutP } from "../utils/commons";

const TIMEOUT = 55000;

const jarvis = async (env, prompt) => {
  const mainFlow = async () => {
    await sendKey(4, [env.OPENAI_API_TOKEN]);
    await sendKey(7, [env.HUGGING_FACE_TOKEN]);

    const inputResult = await sendKey(5, [[], prompt]);
    console.log(inputResult);
    const outputResult = await sendKey(6, [[[prompt, null]]]);
    console.log("res", outputResult);

    const text = outputResult[0];
    return {
      text,
    };
  };

  const res = await Promise.race([
    mainFlow(),
    timeoutP(
      {
        text: `Jarvis timeout error (${TIMEOUT}ms)`,
        error: true,
      },
      TIMEOUT
    ),
  ]);

  return res;
};

export default jarvis;
