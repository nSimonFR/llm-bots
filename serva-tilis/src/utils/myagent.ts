import {
  AgentArgs,
  OutputParserArgs,
  StructuredChatAgent,
  StructuredChatCreatePromptArgs,
  StructuredChatOutputParserWithRetries,
} from "langchain/agents";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { StructuredTool } from "langchain/tools";

import type { BaseLanguageModel } from "langchain/dist/base_language";

class MyAgent extends StructuredChatAgent {
  static createPrompt(
    tools: StructuredTool[],
    args?: StructuredChatCreatePromptArgs
  ) {
    //#region prompts
    const PREFIX = `Answer the following questions truthfully and as best you can.`;
    const AGENT_ACTION_FORMAT_INSTRUCTIONS = `Output a JSON markdown code snippet containing a valid JSON blob (denoted below by $JSON_BLOB).
This $JSON_BLOB must have a "action" key (with the name of the tool to use) and an "action_input" key (tool input).

Valid "action" values: "Final Answer" (which you must use when giving your final response to the user), or one of [{tool_names}].

The $JSON_BLOB must be valid, parseable JSON and only contain a SINGLE action. Here is an example of an acceptable output:

\`\`\`json
{{
  "action": $TOOL_NAME,
  "action_input": $INPUT
}}
\`\`\`

Remember to include the surrounding markdown code snippet delimiters (begin with "\`\`\`" json and close with "\`\`\`")!
`;
    const FORMAT_INSTRUCTIONS = `You have access to the following tools.
You must format your inputs to these tools to match their "JSON schema" definitions below.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Here are the JSON Schema instances for the tools you have access to:

{tool_schemas}

The way you use the tools is as follows:

------------------------

${AGENT_ACTION_FORMAT_INSTRUCTIONS}

If you are using a tool, "action_input" must adhere to the tool's input schema, given above.

------------------------

ALWAYS use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action:
\`\`\`json
$JSON_BLOB
\`\`\`
Observation: the result of the action
... (this Thought/Action/Observation can repeat N times)
Thought: I now know the final answer
Action:
\`\`\`json
{{
  "action": "Final Answer",
  "action_input": "Final response to human"
}}
\`\`\``;
    const SUFFIX = `Begin! Reminder to ALWAYS use the above format and respond in French, and to use tools if appropriate.`;
    //#endregion

    const {
      prefix = PREFIX,
      suffix = SUFFIX,
      inputVariables = ["input", "agent_scratchpad", "chat_history"],
    } = args ?? {};

    const template = [prefix, FORMAT_INSTRUCTIONS].join("\n\n");
    const humanMessageTemplate = "{input}\n\n{agent_scratchpad}";
    const messages = [
      new SystemMessagePromptTemplate(
        new PromptTemplate({
          template,
          inputVariables,
          partialVariables: {
            tool_schemas: StructuredChatAgent.createToolSchemasString(tools),
            tool_names: tools.map((tool) => tool.name).join(", "),
          },
        })
      ),
      SystemMessagePromptTemplate.fromTemplate(
        `Here are some previous messages from our conversation:`
      ),
      new MessagesPlaceholder("chat_history"),
      new HumanMessagePromptTemplate(
        new PromptTemplate({
          template: humanMessageTemplate,
          inputVariables,
        })
      ),
      SystemMessagePromptTemplate.fromTemplate(suffix),
    ];
    return ChatPromptTemplate.fromPromptMessages(messages);
  }

  static getDefaultOutputParser(
    fields?: OutputParserArgs & {
      toolNames: string[];
    }
  ) {
    return new StructuredChatOutputParserWithRetries({
      toolNames: fields?.toolNames,
    });
  }

  static fromLLMAndTools(
    llm: BaseLanguageModel,
    tools: StructuredTool[],
    args?: StructuredChatCreatePromptArgs & AgentArgs
  ) {
    MyAgent.validateTools(tools);
    const prompt = MyAgent.createPrompt(tools, args);
    const outputParser =
      args?.outputParser ??
      MyAgent.getDefaultOutputParser({
        llm,
        toolNames: tools.map((tool) => tool.name),
      });
    const chain = new LLMChain({
      prompt,
      llm,
      callbacks: args?.callbacks,
    });

    return new MyAgent({
      llmChain: chain,
      outputParser,
      allowedTools: tools.map((t) => t.name),
    });
  }
}

export default MyAgent;
