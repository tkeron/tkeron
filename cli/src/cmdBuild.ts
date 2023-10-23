import { build } from "./build";

export const cmdBuild = (
  { sourceDir, outputDir } = { sourceDir: "", outputDir: "" }
) =>
  build({
    sourceDir,
    outputDir,
    hotRestart: false,
    ignoreConsoleLogs: true,
    ignoreErrors: true,
  });
