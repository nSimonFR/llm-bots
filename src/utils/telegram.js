const telegramHelper = async (env, url, body = undefined) => {
  // if (process.env.NODE_ENV === "test") return;

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}${url}`,
    { method: body ? "POST" : "GET", body }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

export const sendMessageToTelegram = async (env, chat_id, text) =>
  telegramHelper(
    env,
    `/sendMessage?${new URLSearchParams({
      chat_id,
      text: text.replace("#", ""),
      parse_mode: "Markdown",
    })}`
  );

export const sendPhotoToTelegram = async (
  env,
  chat_id,
  photo,
  format = "jpg"
) => {
  const formData = new FormData();

  // Check if file or blob:
  if (typeof photo.name === "string") {
    const randomId = Math.round(Date.now()).toString(36);
    formData.append("photo", photo, `${randomId}.${format}`);
  } else {
    formData.append("photo", photo);
  }

  return telegramHelper(
    env,
    `/sendPhoto?${new URLSearchParams({
      chat_id,
      parse_mode: "Markdown",
    })}`,
    formData
  );
};

export const sendAudioToTelegram = async (
  env,
  chat_id,
  audio,
  format = "mp3"
) => {
  const formData = new FormData();
  const randomId = Math.round(Date.now()).toString(36);
  formData.append("document", audio, `${randomId}.${format}`);

  return telegramHelper(
    env,
    `/sendDocument?${new URLSearchParams({
      chat_id,
      parse_mode: "Markdown",
    })}`,
    formData
  );
};
