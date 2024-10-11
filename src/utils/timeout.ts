export const timeout = (ms: number) =>
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Call reached timeout")), ms),
  );
