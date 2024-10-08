export const fromBase64 = (base64str: string): string =>
  Buffer.from(base64str, "base64").toString("utf-8");

export const toBase64 = (base64str: string): string =>
  Buffer.from(base64str, "utf-8").toString("base64");
