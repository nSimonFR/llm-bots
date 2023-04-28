import speech from "@google-cloud/speech";

const speechToTextGoogle = async (fileUrl) => {
  console.log(fileUrl);

  const file = await fetch(fileUrl);
  const data = await file.arrayBuffer();
  const content = new Uint8Array(data);

  const credentials = {};

  const client = new speech.SpeechClient({
    credentials,
    projectId: credentials.project_id,
  });

  const request = {
    audio: {
      content,
    },
    config: {
      encoding: "OGG_OPUS",
      sampleRateHertz: 48000,
      languageCode: "en-GB",
    },
    // interimResults: true,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);

  return transcription;
};

/* NOT COMPATIBLE WITH OGA/OGG (Telegram format) */
const speechToTextWhisper = async (fileUrl) => {
  const file = await fetch(fileUrl);

  const formData = new FormData();
  formData.append("file", await file.blob());
  // formData.append("file", new File([fileUrl], "audio-transcribe"));
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );
  const json = await response.json();

  console.log(json);
  if (json.error) {
    throw new Error(`OpenAI Whisper Error: ${JSON.stringify(json.error)}`);
  }
  return json.data[0].embedding;
};

export default speechToTextWhisper;
