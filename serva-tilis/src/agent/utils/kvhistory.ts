import { ChatMessageHistory } from "langchain/memory";
import {
  HumanChatMessage,
  AIChatMessage,
  BaseChatMessage,
  BaseChatMessageHistory,
} from "langchain/schema";

export default class KVMessageHistory extends BaseChatMessageHistory {
  private messages: BaseChatMessage[] = [];
  private kvstore: KVNamespace;
  private key: string;

  constructor(kvstore: KVNamespace, key: string) {
    super();
    this.kvstore = kvstore;
    this.key = key;
  }

  async getMessages(): Promise<BaseChatMessage[]> {
    const messagesJson: BaseChatMessage[] | null = await this.kvstore.get(
      this.key,
      { type: "json" }
    );

    this.messages = (messagesJson || []).map((e) => {
      switch (e.name) {
        case "human":
          return new HumanChatMessage(e.text);

        case "ai":
          return new AIChatMessage(e.text);

        default:
          throw new Error(`Invalid message type ${e.name}`);
      }
    });

    return this.messages;
  }

  async saveMessages() {
    const messages = this.messages.map((m) => ({
      text: m.text,
      name: m._getType(),
    }));
    await this.kvstore.put(this.key, JSON.stringify(messages));
  }

  async addUserMessage(message: string) {
    this.messages.push(new HumanChatMessage(message));
    await this.saveMessages();
  }

  async addAIChatMessage(message: string) {
    this.messages.push(new AIChatMessage(message));
    await this.saveMessages();
  }

  async clear() {
    this.messages = [];
    await this.kvstore.delete(this.key);
  }
}
