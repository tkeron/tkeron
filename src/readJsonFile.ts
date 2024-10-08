import fs from "fs";
import { normalize } from "path";

export const readJsonFile = (filePath: string) => {
  try {
    filePath = normalize(filePath);
    const pkg = fs.readFileSync(filePath, { encoding: "utf-8" });
    const json = JSON.parse(pkg);
    return json;
  } catch (_) {
    return undefined;
  }
};
