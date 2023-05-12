const telegramHelper = async (url, body) => {
  if (process.env.NODE_ENV === "test") return null;

  const headers = {};

  if (typeof body === "object") {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}${url}`,
    { method: "POST", body, headers }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(url, body, error);
    throw new Error(error);
  }

  return response.json();
};

export const sendMessageToTelegram = async (chat_id, text) => {
  const textEscaped = text.replace(
    /([\_\*\[\]\(\)\~\>\#\+\-\=\|\{\}\.\!\\])/g,
    "\\$1"
  );

  return telegramHelper(`/sendMessage`, {
    chat_id,
    text: textEscaped,
    parse_mode: "MarkdownV2",
  });
};

export const sendChatActionToTelegram = async (chat_id, action = "typing") =>
  telegramHelper(`/sendChatAction`, {
    chat_id,
    action,
  });

export const sendPhotoToTelegram = async (chat_id, photo, format = "jpg") => {
  const formData = new FormData();
  formData.append("chat_id", chat_id);

  // Check if file or blob:
  if (typeof photo.name === "string") {
    const randomId = Math.round(Date.now()).toString(36);
    formData.append("photo", photo, `${randomId}.${format}`);
  } else {
    formData.append("photo", photo);
  }

  return telegramHelper(`/sendPhoto`, formData);
};

export const sendAudioToTelegram = async (chat_id, audio, format = "mp3") => {
  const randomId = Math.round(Date.now()).toString(36);

  const formData = new FormData();
  formData.append("document", audio, `${randomId}.${format}`);
  formData.append("chat_id", chat_id);

  return telegramHelper(`/sendDocument`, formData);
};

export const getAudioFromTelegram = async (fileId) => {
  const file = await telegramHelper(`/getFile?file_id=${fileId}`);
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${file.result.file_path}`;
};
