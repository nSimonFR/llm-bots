const transcribeAudioToText = async (url) => {
  const response = await fetch(process.env.SPEECH_TO_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: process.env.SPEECH_TO_TEXT_TOKEN,
      url,
    }),
  });

  return response.text();
};

export default transcribeAudioToText;
