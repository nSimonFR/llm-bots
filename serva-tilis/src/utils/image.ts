const timeoutP = <T>(value: T, timeout: number): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), timeout);
  });

export const refinePrompt = async (prompt: string) => {
  const promise = fetch(
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

  const TIMEOUT = 3000;
  const response: Response | null = await Promise.race([
    promise,
    timeoutP(null, TIMEOUT),
  ]);
  if (!response) {
    throw new Error(`no_response`);
  }

  if (response.status !== 200) {
    throw new Error(`invalid_status_${response.status}`);
  }

  const promptJson: any = await response.json();

  if (!promptJson.length) {
    throw new Error(`no_prompt`);
  }

  return promptJson[0].generated_text;
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

    if (response.status !== 200) {
      throw new Error(`invalid_status_${response.status}`);
    }

    return response.blob();
  };
