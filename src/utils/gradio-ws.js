const SESSION_HASH = "kzzqyl2no6d";

const send = (ws, val) => ws.send(JSON.stringify(val));

const waitForMessage = (ws, key) =>
  new Promise((resolve) => {
    const method = (message) => {
      const data = JSON.parse(message.data);
      if (data.msg === key) {
        resolve(data);
        ws.removeEventListener("message", method);
      }
    };

    ws.addEventListener("message", method);
  });

export const connectToWebSocket = async (url) => {
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

export const sendKey = async (keyIndex, keyData) => {
  const url = "https://microsoft-hugginggpt.hf.space/queue/join";
  const ws = await connectToWebSocket(url);
  ws.accept();

  send(ws, { fn_index: keyIndex, session_hash: SESSION_HASH });
  await waitForMessage(ws, "send_data");

  send(ws, {
    fn_index: 4,
    data: [null, ...keyData],
    event_data: null,
    session_hash: SESSION_HASH,
  });
  const result = await waitForMessage(ws, "process_completed");

  ws.close();

  if (!result.success) {
    throw new Error(`No success ${JSON.stringify(result)}`);
  }

  console.log("rz", result);
  return result.output.data;
};
