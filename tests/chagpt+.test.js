import dotenv from "dotenv";

import chatGPTPlus from "../src/bots/chagpt+";
import { replyText } from "../src/bots/chagpt+/commands/text";
import { generateImage } from "../src/bots/chagpt+/commands/image";
import { generateAudio } from "../src/bots/chagpt+/commands/audio";

import commandsInit from "../src/bots/chagpt+/messages/commands/init";

import { sendMessageToTelegram } from "../src/utils/telegram";
import memory from "../src/utils/memory";
import getEmbedding from "../src/utils/embeddings";

import embeddings from "./embeddings";

dotenv.config();

const TIMEOUT = 60000;
const env = process.env;

describe("chatGPT+", () => {
  test(
    "text generation message",
    async () => {
      const prompt = "Generate a small story about a cat";
      const username = "test";

      const result = await chatGPTPlus(env, prompt, username);
      console.log(result.text);

      expect(result.text).toContain("cat");
    },
    TIMEOUT
  );

  test(
    "image generation message",
    async () => {
      const prompt = "Generate an image of a black cat on a white background";

      const result = await chatGPTPlus(env, prompt);

      expect(result.text).toContain("Generated image");
    },
    TIMEOUT
  );

  test(
    "audio generation message",
    async () => {
      const prompt = "Generate an audio story about a cat";

      const result = await chatGPTPlus(env, prompt);

      expect(result.text).toContain("Generated audio");
    },
    TIMEOUT
  );
});

describe("commands", () => {
  test("replyText", async () => {
    await replyText(env, { prompt: "A blue man walks into a store." });
    // TODO test telegram sent
    expect(1).toBe(1);
  });

  describe("generateImage", () => {
    test("stable_diffusion", async () => {
      await generateImage(env, {
        prompt: "A robot eating the earth.",
        engine: "stable_diffusion",
      });
      // TODO test telegram sent
      expect(1).toBe(1);
    });

    test("dall_e", async () => {
      await generateImage(env, {
        prompt: "A robot eating the earth.",
        engine: "dall_e",
      });
      // TODO test telegram sent
      expect(1).toBe(1);
    }, 10000);

    test("midjourney", async () => {
      await generateImage(env, {
        prompt: "A robot eating the earth.",
        engine: "midjourney",
      });
      // TODO test telegram sent
      expect(1).toBe(1);
    }, 15000);
  });

  test("generateAudio", async () => {
    await generateAudio(env, { prompt: "A blue man walks into a store." });
    // TODO test telegram sent
    expect(1).toBe(1);
  });
});

describe("messages", () => {
  test("commands/init", async () => {
    const username = "TestUser";
    const prompt = "Goal 1\nGoal2";
    const message = commandsInit(username, prompt);

    console.log(message);

    expect(message).toContain(username);
    prompt.split("\n").map((g) => expect(message).toContain(g));
  });
});

describe("utils", () => {
  test("telegram", async () => {
    await sendMessageToTelegram(env, env.ADMIN_CHAT_ID, "Hello world !");
  });

  test("embeddings", async () => {
    const embedding = await getEmbedding(env, "Hello world !");

    expect(Array.isArray(embedding)).toBe(true);
    expect(Number.isNaN(parseFloat(embedding[0]))).toBe(false);
  });

  test("memory", async () => {
    const { insert, query } = await memory(env);

    const w = (e) => [e.values, { prompt: e.value, result: e.result }];

    await Promise.all([
      insert(1, ...w(embeddings.hello_world)),
      insert(2, ...w(embeddings.hello_blob)),
      insert(5, ...w(embeddings.forty_two)),
      insert(3, ...w(embeddings.hello)),
      insert(4, ...w(embeddings.world)),
    ]);

    const results = await query(embeddings.prompt.values);
    expect(results[0].id).toBe("5");
  });
});
