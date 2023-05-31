export const setImmediateInterval = (
  action: () => Promise<any>,
  delay: number
) => {
  const interval = setInterval(action, delay);
  action();
  return interval;
};
