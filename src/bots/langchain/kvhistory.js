import {
  HumanChatMessage,
  AIChatMessage,
  BaseChatMessageHistory,
} from "langchain/schema";

export default class KVHistory extends BaseChatMessageHistory {
  constructor(kvstore, key) {
    super();
    this.messages = [];
    this.kvstore = kvstore;
    this.key = key;
  }

  async getMessages() {
    const messages = await this.kvstore.get(this.key, { type: "json" });

    this.messages = (messages || []).map((m) => {
      switch (m.type) {
        case "human": {
          const typedMessage = new HumanChatMessage(m.text);
          typedMessage.type = "human";
          return typedMessage;
        }
        case "ai": {
          const typedMessage = new AIChatMessage(m.text);
          typedMessage.type = "ai";
          return typedMessage;
        }
        default:
          throw new Error(`invalid messagetype: ${m.type}`);
      }
    });

    // console.log(
    //   [
    //     "Loaded messages:",
    //     ...this.messages.map((m) => `${m.type}: ${m.text}`),
    //   ].join("\n")
    // );

    return this.messages;
  }

  async addMessage(message) {
    this.messages.push(message);
    await this.kvstore.put(this.key, JSON.stringify(this.messages));
  }

  async addUserMessage(message) {
    const typedMessage = new HumanChatMessage(message);
    typedMessage.type = "human";
    return this.addMessage(typedMessage);
  }

  async addAIChatMessage(message) {
    const typedMessage = new AIChatMessage(message);
    typedMessage.type = "ai";
    return this.addMessage(typedMessage);
  }

  async clear() {
    this.messages = [];
    await this.kvstore.delete(this.key);
  }
}
