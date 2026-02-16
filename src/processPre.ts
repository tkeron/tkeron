import { join, dirname } from "path";
import { getFilePaths } from "@tkeron/tools";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";

const packageJsonPath = join(import.meta.dir, "..", "package.json");
const packageJson = await Bun.file(packageJsonPath).json();
const TKERON_VERSION = packageJson.version;

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
</body>
</html>`;

export interface ProcessPreOptions {
  logger?: Logger;
  projectRoot?: string;
}

export const processPre = async (
  tempDir: string,
  options: ProcessPreOptions = {},
): Promise<boolean> => {
  const log = options.logger || silentLogger;

  if (!tempDir || typeof tempDir !== "string") {
    log.error(`\n❌ Error: Invalid tempDir provided for processPre.`);
    return false;
  }

  const preFiles = getFilePaths(tempDir, "**/*.pre.ts", true);

  const hasChanges = preFiles.length > 0;

  for (const preFile of preFiles) {
    const htmlFile = preFile.replace(/\.pre\.ts$/, ".html");

    const originalCode = await Bun.file(preFile).text();

    const htmlContent = (await Bun.file(htmlFile).exists())
      ? await Bun.file(htmlFile).text()
      : DEFAULT_HTML;

    const modifiedCode = `
        import { parseHTML } from "@tkeron/html-parser";

        const htmlPath = ${JSON.stringify(htmlFile)};
        const htmlContent = ${JSON.stringify(htmlContent)};
        const document = parseHTML(htmlContent);

        ${originalCode}


        const doctype = '<!DOCTYPE html>\\n';
        const htmlOutput = doctype + document.documentElement.outerHTML;
        await Bun.write(htmlPath, htmlOutput);
    `;

    await Bun.write(preFile, modifiedCode);

    const proc = Bun.spawn(["bun", "run", preFile], {
      cwd: options.projectRoot || dirname(preFile),
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        TKERON_VERSION,
      },
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      const stdout = await new Response(proc.stdout).text();
      log.error(
        `\n❌ Error: Pre-rendering failed for ${preFile.split("/").pop()}`,
      );
      log.error(`\n💡 File: ${preFile}`);
      if (stderr) {
        log.error(`\nError details:\n${stderr}`);
      }
      if (stdout) {
        log.error(`\nOutput:\n${stdout}`);
      }
      log.error("");
      throw new Error(`Pre-rendering failed for ${preFile}`);
    }
  }

  return hasChanges;
};
