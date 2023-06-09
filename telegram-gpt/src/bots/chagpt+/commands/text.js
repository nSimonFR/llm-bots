export const replyText = async ({ prompt }) => prompt;

const settings = {
  command_name: "reply_text",
  args: { prompt: "<text>" },
};

export default {
  name: "reply_text",
  settings,
  function: replyText,
};
