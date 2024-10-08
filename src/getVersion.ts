import { join } from "path";
import { readJsonFile } from "./readJsonFile";

export const getPackageJson = (): any => {
  const path = join(__dirname, "..", "package.json");
  const pkg = readJsonFile(path);
  return pkg;
};

export const getVersion = (): string => {
  const { version } = getPackageJson() || {};
  return version;
};
