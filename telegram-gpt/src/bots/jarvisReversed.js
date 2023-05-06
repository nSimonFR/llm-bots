/**
 * An attempt to reving Gradio Websocket / Queue system
 * In order to access Jarvis / HuggingFace for free
 *
 * DOES NOT WORK !
 */

import { sendKey } from "../utils/gradio-ws";
import { timeoutP } from "../utils/commons";

const TIMEOUT = 55000;

const jarvis = async (prompt) => {
  const mainFlow = async () => {
    await sendKey(4, [process.env.OPENAI_API_KEY]);
    await sendKey(7, [process.env.HUGGING_FACE_TOKEN]);

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
