const telegramHelper = async (
  url: string,
  body: FormData | undefined = undefined
) => {
  if (process.env.NODE_ENV === "test") return null;

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}${url}`,
    { method: body ? "POST" : "GET", body }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(url, body, error);
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

export const sendPhotoToTelegram = async (
  chat_id: string,
  photo: string | Blob,
  format = "jpg"
) => {
  const formData = new FormData();

  if (photo instanceof Blob) {
    const randomId = Math.round(Date.now()).toString(36);
    formData.append("photo", photo, `${randomId}.${format}`);
  } else {
    formData.append("photo", photo);
  }

  return telegramHelper(
    `/sendPhoto?${new URLSearchParams({
      chat_id,
      parse_mode: "Markdown",
    })}`,
    formData
  );
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
      parse_mode: "Markdown",
    })}`,
    formData
  );
};

// export const getAudioFromTelegram = async (fileId: string) => {
//   const file = await telegramHelper(`/getFile?file_id=${fileId}`);
//   return `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${file.result.file_path}`;
// };
