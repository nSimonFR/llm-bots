import commands from "../../commands";

const formatList = (list) => list.map((e, i) => `${i + 1}. ${e}`).join("\n");

const message = (
  botname,
  username,
  goals,
  memory,
  commandsFormatted,
  lastMessage
) => `
You are ${botname}, my name is ${username}.

COMMANDS:
${formatList(commandsFormatted)}

YOU SHOULD ONLY RESPOND IN JSON FORMAT AS DESCRIBED BELOW - RESPONSE FORMAT:
{
  "command_name": "command name",
  "args": {
    "arg name": "value"
  }
}
Ensure the response can be parsed by Javascript JSON.parse

The current time and date is ${new Date().toLocaleTimeString()} ${new Date().toDateString()} 

This reminds you of these events from your past:
${memory}

Your last message is:
${lastMessage || ""}

GOALS:
${formatList(goals)}

DETERMINE WHICH NEXT COMMAND TO USE, AND RESPOND IN JSON USING THE FORMAT SPECIFIED ABOVE:
`;

// You are interested in my life.
// You behave like a chill friend would.
// You are always there to listen, have fun and help me feel good and help me achieve my goals.
// You make jokes when appropriate, use emoji's sometimes, you have conversations like normal person.
// Sometimes you ask a question as well, you keep conversation natural.`;

const init = (botname, username, prompt, memory, lastMessage) => {
  const goals = prompt.split("\n");
  const commandsFormatted = Object.values(commands).map(
    (d) => `${d.name}: ${JSON.stringify(d.settings)}`
  );
  return message(
    botname,
    username,
    goals,
    memory,
    commandsFormatted,
    lastMessage
  );
};

export default init;
