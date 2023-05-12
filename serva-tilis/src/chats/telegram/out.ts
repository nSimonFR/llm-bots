export const telegramHelper = async (
  url: string,
  body: FormData | undefined = undefined
) => {
  if (process.env.NODE_ENV === "test") return null;

  const baseURL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;
  const response = await fetch(baseURL + url, {
    method: body ? "POST" : "GET",
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(url, JSON.stringify(body), error);
    throw new Error(error);
  }

  return response.json();
};

export const sendMessageToTelegram = async (chat_id: string, text: string) =>
  telegramHelper(
    `/sendMessage?${new URLSearchParams({
      chat_id,
      text: text.replace("#", ""),
      parse_mode: "Markdown",
    })}`
  );

export const sendChatActionToTelegram = async (
  chat_id: string,
  action: string
) =>
  telegramHelper(
    `/sendChatAction?${new URLSearchParams({
      chat_id,
      action,
    })}`
  );

export const sendPhotoToTelegram = async (
  chat_id: string,
  photo: string | Blob,
  caption?: string,
  format = "jpg"
) => {
  const formData = new FormData();

  if (photo instanceof Blob) {
    const randomId = Math.round(Date.now()).toString(36);
    formData.append("photo", photo, `${randomId}.${format}`);
  } else {
    formData.append("photo", photo);
  }

  const query: Record<string, string> = { chat_id };
  if (caption) {
    query.caption = caption;
  }

  return telegramHelper(`/sendPhoto?${new URLSearchParams(query)}`, formData);
};

export const sendAudioToTelegram = async (
  chat_id: string,
  audio: Blob,
  format = "mp3"
) => {
  const formData = new FormData();
  const randomId = Math.round(Date.now()).toString(36);
  formData.append("document", audio, `${randomId}.${format}`);

  return telegramHelper(
    `/sendDocument?${new URLSearchParams({
      chat_id,
    })}`,
    formData
  );
};

export const getAudioFromTelegram = async (fileId: string) => {
  const file: any = await telegramHelper(`/getFile?file_id=${fileId}`);
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${file.result.file_path}`;
};
