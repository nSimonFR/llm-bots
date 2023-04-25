const message = (botname, username, prompt, memory, lastMessage) => `
You are ${botname}, my name is ${username}

You have long-term memory. You remember things. You have access to some of my personal information.
The current time and date is ${new Date().toISOString()}

This reminds you of these events from your past:
${memory}

Your last message is:
${lastMessage || ""}

Answer the following prompt:
${prompt}
`;

export default message;
