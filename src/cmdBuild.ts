import { build } from "./build";


export const cmdBuild = (sourceDir?: string, outputDir?: string) => build({
    sourceDir, outputDir,
    hotRestart: false,
    ignoreConsoleLogs: true,
    ignoreErrors: true
});
