import {
  writeFile,
  mkdir,
} from "fs/promises";
import { join } from "path";
import { getExtModules } from "./buildLoaders";
import { createTsConfigFile } from "./createTsConfigFile";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";

export const cmdInit = async (
  { sourceDir, outputDir } = { sourceDir: "", outputDir: "" }
) => {
  const options = getOptions({ sourceDir, outputDir });
  sourceDir = options.sourceDir;
  await writeFile("tkeron.json", JSON.stringify(options, null, 4));
  await createTsConfigFile();
  if (!(await fileExists(sourceDir)))
    await mkdir(sourceDir, { recursive: true });

  const dotTkeron = join(sourceDir, "..", ".tkeron");
  if (!(await fileExists(dotTkeron))) await mkdir(dotTkeron, { recursive: true });

  const extModules = getExtModules();
  const extModName = join(dotTkeron, "..", "extensions.d.ts");
  await writeFile(extModName, extModules, { encoding: "utf-8" });
};
