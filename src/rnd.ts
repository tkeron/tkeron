import crypto from "crypto";
import { toHexString } from "./utils";

export const rnds = (n: number) => toHexString(crypto.randomBytes(n)).slice(0, n);
