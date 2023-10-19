import { Callback } from "@tkeron/commands";
import { build } from "./build";

export const cmdBuild: Callback = (
  { sourceDir, outputDir } = { sourceDir: "", outputDir: "" },
) =>
  build({
    sourceDir,
    outputDir,
    hotRestart: false,
    ignoreConsoleLogs: true,
    ignoreErrors: true,
  });
