import { join, dirname } from "path";
import { getFilePaths } from "@tkeron/tools";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";

const HTML_PARSER_PATH = import.meta.resolve("@tkeron/html-parser");

export interface ProcessPostOptions {
  logger?: Logger;
  projectRoot?: string;
}

export const processPost = async (
  tempDir: string,
  options: ProcessPostOptions = {},
): Promise<boolean> => {
  const log = options.logger || silentLogger;

  if (!tempDir || typeof tempDir !== "string") {
    log.error(`\n❌ Error: Invalid tempDir provided for processPost.`);
    return false;
  }

  const postFiles = getFilePaths(tempDir, "**/*.post.ts", true);

  if (postFiles.length === 0) return false;

  for (const postFile of postFiles) {
    const htmlFile = postFile.replace(/\.post\.ts$/, ".html");

    const originalCode = await Bun.file(postFile).text();

    const htmlContent = await Bun.file(htmlFile).text();

    const modifiedCode = `
        import { parseHTML } from ${JSON.stringify(HTML_PARSER_PATH)};

        const htmlPath = ${JSON.stringify(htmlFile)};
        const htmlContent = ${JSON.stringify(htmlContent)};
        const document = parseHTML(htmlContent);

        ${originalCode}


        const doctype = '<!DOCTYPE html>\\n';
        const htmlOutput = doctype + document.documentElement.outerHTML;
        await Bun.write(htmlPath, htmlOutput);
    `;

    await Bun.write(postFile, modifiedCode);

    const proc = Bun.spawn(["bun", "run", postFile], {
      cwd: options.projectRoot || dirname(postFile),
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env },
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      const stdout = await new Response(proc.stdout).text();
      log.error(
        `\n❌ Error: Post-processing failed for ${postFile.split("/").pop()}`,
      );
      log.error(`\n💡 File: ${postFile}`);
      if (stderr) {
        log.error(`\nError details:\n${stderr}`);
      }
      if (stdout) {
        log.error(`\nOutput:\n${stdout}`);
      }
      log.error("");
      throw new Error(`Post-processing failed for ${postFile}`);
    }
  }

  return true;
};
