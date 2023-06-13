import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";

import { treatMessage } from "../../bots";
import { MyRes } from "../..";

const checkAndParse = async (
  request: Request,
  store: KVNamespace
): Promise<Response> => {
  if (request.method !== "POST") {
    return MyRes(405, "Method Not Allowed");
  }

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  const body = await request.clone().arrayBuffer();
  const isValidRequest = verifyKey(
    body,
    signature as string,
    timestamp as string,
    process.env.DISCORD_PUBLIC_KEY as string
  );

  console.log(await request.clone().text());
  if (!isValidRequest) {
    throw new Error("Invalid Request.");
  }

  const json: any = await request.json();

  if (json.type === InteractionType.PING) {
    return MyRes(
      200,
      JSON.stringify({
        type: InteractionResponseType.PONG,
      })
    );
  }

  if (json.type !== InteractionType.APPLICATION_COMMAND) {
    return MyRes(400, "Unknown Interaction");
  }

  const message = json.data.name;
  const response = await treatMessage(
    "testid",
    "testusername",
    message,
    store
  ).catch((e: any) => console.error(e.stack));

  return MyRes(
    200,
    JSON.stringify({
      type: 4,
      data: {
        content: "Hello world !",
      },
    })
  );
};

export default checkAndParse;
