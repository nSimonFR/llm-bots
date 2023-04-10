export const sendMessageToTelegram = async (env, chatId, unprocessedText) => {
  if (process.env.NODE_ENV === "test") return;

  const text = unprocessedText.replace("#", "");
  const telegramURL = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendMessage`;
  const res = await fetch(
    `${telegramURL}?chat_id=${chatId}&text=${text}&parse_mode=Markdown`
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }
};

export const sendPhotoToTelegram = async (
  env,
  chatId,
  photo,
  format = "jpg"
) => {
  // if (process.env.NODE_ENV === "test") return;

  const formData = new FormData();
  const randomId = Math.round(Date.now()).toString(36);
  formData.append("photo", photo, `${randomId}.${format}`);

  const telegramURL = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendPhoto`;
  const res = await fetch(`${telegramURL}?chat_id=${chatId}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
};

export const sendAudioToTelegram = async (
  env,
  chatId,
  audio,
  format = "mp3"
) => {
  if (process.env.NODE_ENV === "test") return;

  const formData = new FormData();
  const randomId = Math.round(Date.now()).toString(36);
  formData.append("document", audio, `${randomId}.${format}`);

  const telegramURL = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendDocument`;
  const res = await fetch(`${telegramURL}?chat_id=${chatId}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
};
