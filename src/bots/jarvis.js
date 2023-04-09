import { sendKey, connectToWebSocket } from "../utils/huggingface-ws";

const jarvis = async (env, prompt) => {
  const url = "https://microsoft-hugginggpt.hf.space/queue/join";
  const ws = await connectToWebSocket(url);

  ws.accept();

  console.log("connected, sending prompt:", prompt);

  await Promise.all([
    sendKey(ws, 4, env.OPENAI_API_TOKEN),
    sendKey(ws, 7, env.HUGGING_FACE_TOKEN),
  ]);

  const res = await sendKey(ws, 6, [[prompt, null]]);
  console.log(res);
};

export default jarvis;
