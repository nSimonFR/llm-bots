const transcribeAudioToText = async (url: string, config: unknown) => {
  const response = await fetch(process.env.SPEECH_TO_TEXT_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: process.env.SPEECH_TO_TEXT_TOKEN,
      url,
      config,
    }),
  });

  const text = await response.text();

  if (response.status !== 200) {
    throw new Error(text);
  }

  return text;
};

export default transcribeAudioToText;
