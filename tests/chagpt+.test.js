import dotenv from "dotenv";

import chatGPTPlus from "../src/bots/chagpt+";
import { generateText } from "../src/bots/chagpt+/commands/text";
import { generateImage } from "../src/bots/chagpt+/commands/image";
import { generateAudio } from "../src/bots/chagpt+/commands/audio";
import init from "../src/bots/chagpt+/messages/init";

dotenv.config();

const TIMEOUT = 60000;
const env = process.env;

describe("chatGPT+", () => {
  test(
    "text generation message",
    async () => {
      const prompt = "Generate a small story about a cat";

      const result = await chatGPTPlus(env, prompt);
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
  test("generateText", async () => {
    await generateText(env, "A blue man walks into a store.");
    // TODO test telegram sent
    expect(1).toBe(1);
  });

  test("generateImage", async () => {
    await generateImage(env, "A robot eating the earth.");
    // TODO test telegram sent
    expect(1).toBe(1);
  }, 60000);

  test("generateAudio", async () => {
    await generateAudio(env, "A blue man walks into a store.");
    // TODO test telegram sent
    expect(1).toBe(1);
  });
});

describe("messages", () => {
  test("init", async () => {
    const username = "TestUser";
    const prompt = "Goal 1\nGoal2";
    const message = init(username, prompt);

    console.log(message);

    expect(message).toContain(username);
    prompt.split("\n").map((g) => expect(message).toContain(g));
  });
});
