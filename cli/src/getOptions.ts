import { readJsonFile } from "./readJsonFile";

export interface tkeronOpts {
  sourceDir: string;
  outputDir: string;
}

export const getOptions = (opts?: {
  sourceDir?: string;
  outputDir?: string;
}): tkeronOpts => {
  const jsonOpt = readJsonFile("tkeron.json") as tkeronOpts;
  if (!opts) opts = {} as any;
  const { outputDir, sourceDir } = opts;
  const defaultOpt: tkeronOpts = {
    sourceDir: sourceDir || "front",
    outputDir: outputDir || "web",
  };
  if (!jsonOpt) {
    return defaultOpt;
  }
  Object.keys(defaultOpt).forEach((key) => {
    if (key in jsonOpt) (defaultOpt as any)[key] = (jsonOpt as any)[key];
  });
  if (sourceDir) defaultOpt.sourceDir = sourceDir;
  if (outputDir) defaultOpt.outputDir = outputDir;
  return defaultOpt;
};
