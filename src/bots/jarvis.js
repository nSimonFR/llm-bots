const SESSION_HASH = "wkzudhm4w";

const send = (ws, val) => ws.send(JSON.stringify(val));

const waitForMessage = (ws, key) =>
  new Promise((resolve) => {
    ws.addEventListener("message", (message) => {
      console.log(JSON.stringify(message));
      const msg = message.data.msg;
      if (msg === key) resolve(msg);
    });
  });

const sendKey = async (ws, keyIndex, keyData) => {
  await send(ws, { fn_index: keyIndex, session_hash: SESSION_HASH });
  await waitForMessage(ws, "send_data");
  await send(ws, {
    fn_index: 4,
    data: [null, keyData],
    event_data: null,
    session_hash: SESSION_HASH,
  });
  const result = await waitForMessage(ws, "process_completed");
  return result.output;
};

const connectToWebSocket = async (url) => {
  const resp = await fetch(url, {
    headers: {
      Upgrade: "websocket",
    },
  });
  const ws = resp.webSocket;
  if (!ws) {
    throw new Error("Server didn't accept WebSocket");
  }
  return ws;
};

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
