export const timeoutP = (value, timeout) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), timeout);
  });

export const errorAndTimeoutWrapper = async (promise) => {
  const TIMEOUT = 120000;

  const handleErrors = async (e) => {
    console.error(e);
    const message = e.statusCode
      ? `${e.statusCode}: ${e.statusText}`
      : e.message;
    return {
      text: `ChatGPT error ${message}`,
      error: true,
    };
  };

  const res = await Promise.race([
    promise.catch(handleErrors),
    timeoutP(
      {
        text: `ChatGPT timeout error (${TIMEOUT}ms)`,
        error: true,
      },
      TIMEOUT
    ),
  ]);

  return res;
};
