import constants from "./constants";

export function sleep(timeoutMs: number = constants.WaitTime) {
  let timeout;
  const promise = new Promise<void>((resolve) => {
    timeout = window.setTimeout(() => {
      resolve();
    }, timeoutMs);
  });
  return { promise, timeout };
}

export async function wait(timeoutMs?: number): Promise<void> {
  const { promise, timeout } = sleep(timeoutMs);
  return promise;
}
