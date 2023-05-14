const telegramHelper = async (url: string, body: object | FormData) => {
  if (process.env.NODE_ENV === "test") return null;

  const headers: HeadersInit = {};

  let bodyToPost: BodyInit;
  if (typeof body === "object") {
    bodyToPost = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  } else {
    bodyToPost = body as FormData;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}${url}`,
    { method: "POST", headers, body: bodyToPost }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(url, body, error);
    throw new Error(error);
  }

  return response.json();
};

export const sendMessageToTelegram = async (
  chat_id: string,
  text: string,
  reply_to_message?: string
) => {
  const textEscaped = text.replace(
    /([\_\*\[\]\(\)\~\>\#\+\-\=\|\{\}\.\!\\])/g,
    "\\$1"
  );

  const message = {
    chat_id,
    text: textEscaped,
    reply_to_message,
    parse_mode: "MarkdownV2",
  };

  return telegramHelper(`/sendMessage`, message);
};

export const sendChatActionToTelegram = async (
  chat_id: string,
  action = "typing"
) =>
  telegramHelper(`/sendChatAction`, {
    chat_id,
    action,
  });

export const sendPhotoToTelegram = async (
  chat_id: string,
  photo: string | Blob,
  format = "jpg"
) => {
  const formData = new FormData();
  formData.append("chat_id", chat_id);

  // Check if file or blob:
  if (photo instanceof Blob) {
    const randomId = Math.round(Date.now()).toString(36);
    formData.append("photo", photo, `${randomId}.${format}`);
  } else {
    formData.append("photo", photo);
  }

  return telegramHelper(`/sendPhoto`, formData);
};

export const sendAudioToTelegram = async (
  chat_id: string,
  audio: Blob,
  format = "mp3"
) => {
  const randomId = Math.round(Date.now()).toString(36);

  const formData = new FormData();
  formData.append("document", audio, `${randomId}.${format}`);
  formData.append("chat_id", chat_id);

  return telegramHelper(`/sendDocument`, formData);
};

export const getAudioFromTelegram = async (file_id: string) => {
  const file: any = await telegramHelper(`/getFile`, { file_id });
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${file.result.file_path}`;
};
