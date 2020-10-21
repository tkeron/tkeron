//@ts-ignore
const toHexString = (bytes: Uint8Array): string => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
export const rnds = (n: number): string => toHexString(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);

