export const refinePrompt = async (prompt: string) => {
  const baseResponse = await fetch(
    "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Stable-Diffusion",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    }
  );

  const promptJson: any = await baseResponse.json();
  const inputs = promptJson[0].generated_text;

  return inputs;
};

export const generateWithHuggingFace =
  (model: string) => async (inputs: string) => {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs,
        }),
      }
    );

    return response.blob();
  };
