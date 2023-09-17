import crypto from "crypto";

export const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export const rnds = (n: number) => toHexString(crypto.randomBytes(n)).slice(0, n);
