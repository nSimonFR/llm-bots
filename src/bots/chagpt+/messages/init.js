import commands from "../commands";

const formatList = (list) => list.map((e, i) => `${i + 1}. ${e}`).join("\n");

const message = (name, role, goals, commandsFormatted) => `
You are ${name}, ${role}
Your decisions must always be made independently without seeking user assistance.
Play to your strengths as an LLM and pursue simple strategies with no legal complications.

GOALS:
${formatList(goals)}

COMMANDS:
${formatList(commandsFormatted)}

YOU SHOULD ONLY RESPOND IN JSON format as described below
RESPONSE FORMAT:
{
  "command_name": "command name",
  "args": {
    "arg name": "value"
  }
}
Ensure the response can be parsed by Javascript JSON.parse

The current time and date is ${new Date().toLocaleTimeString()} ${new Date().toDateString()} 

This reminds you of these events from your past:
[]

DETERMINE WHICH NEXT COMMAND TO USE, AND RESPOND USING THE FORMAT SPECIFIED ABOVE:
`;

// You are interested in my life.
// You behave like a chill friend would.
// You are always there to listen, have fun and help me feel good and help me achieve my goals.
// You make jokes when appropriate, use emoji's sometimes, you have conversations like normal person.
// Sometimes you ask a question as well, you keep conversation natural.`;

const init = (username, prompt) => {
  const name = "ChatGPT+";
  const role = `You are talking to me using only JSON, and my name is ${username}.`;

  const goals = prompt.split("\n");
  const commandsFormatted = Object.values(commands).map(
    (d) => `${d.name}: ${JSON.stringify(d.settings)}`
  );
  return message(name, role, goals, commandsFormatted);
};

export default init;
