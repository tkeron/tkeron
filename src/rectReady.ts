export const rectReady = async (
  querySelector: string,
  limit = 0,
): Promise<DOMRect> => {
  const tryTimeout = 100;
  let timeoutHandler = null;
  let limitHandler = null;
  return new Promise((ok, err) => {
    const tryRect = () => {
      const element = document.querySelector(querySelector);
      if (!element) {
        timeoutHandler = setTimeout(() => tryRect(), tryTimeout);
        return;
      }
      const rect = element.getClientRects();
      if (!rect || rect.length === 0) {
        timeoutHandler = setTimeout(() => tryRect(), tryTimeout);
        return;
      }
      if (limitHandler) clearTimeout(limitHandler);
      ok(rect[0]);
    };
    if (limit > 0)
      limitHandler = setTimeout(() => {
        if (timeoutHandler) clearTimeout(timeoutHandler);
        err("timeout");
      }, limit);
    tryRect();
  });
};
