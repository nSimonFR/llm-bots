/* eslint-disable import/prefer-default-export */

export const timeoutP = (value, timeout) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), timeout);
  });
