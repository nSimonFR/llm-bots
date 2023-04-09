/* eslint-disable import/prefer-default-export */

export const sendMessageToTelegram = async (env, chatId, unprocessedText) => {
  const text = unprocessedText.replace("#", "");
  const telegramURL = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendMessage`;
  await fetch(
    `${telegramURL}?chat_id=${chatId}&text=${text}&parse_mode=Markdown`
  );
};
