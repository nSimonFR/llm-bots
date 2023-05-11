const functions = require("@google-cloud/functions-framework");
const speech = require("@google-cloud/speech").v1p1beta1;

const speechToTextGoogle = async (
  fileUrl,
  config = {
    encoding: "OGG_OPUS",
    sampleRateHertz: 48000,
    languageCode: "fr-FR",
    alternativeLanguageCodes: ["en-US", "fr-FR"],
  }
) => {
  const file = await fetch(fileUrl);
  const data = await file.arrayBuffer();
  const content = new Uint8Array(data);

  const client = new speech.SpeechClient();

  const request = {
    audio: { content },
    config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);

  return transcription;
};

functions.http("speechToText", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(403).send("Forbidden");
  }

  const { token, url, config } = req.body;

  if (token !== process.env.SPEECH_TO_TEXT_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  const text = await speechToTextGoogle(url, config);
  return res.status(200).send(text);
});
