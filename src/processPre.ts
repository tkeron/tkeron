import { join, dirname } from "path";
import { getFilePaths } from "@tkeron/tools";

// Read tkeron version from package.json
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

export const processPre = async (tempDir: string): Promise<boolean> => {
  if (!tempDir || typeof tempDir !== 'string') {
    console.error(`\n❌ Error: Invalid tempDir provided for processPre.`);
    return false;
  }

  // Find all .pre.ts files
  const preFiles = getFilePaths(tempDir, "**/*.pre.ts", true);

  // Return true if there were any .pre.ts files to process
  const hasChanges = preFiles.length > 0;

  for (const preFile of preFiles) {
    // Get corresponding .html file path
    const htmlFile = preFile.replace(/\.pre\.ts$/, ".html");

    // Read original .pre.ts content
    const originalCode = await Bun.file(preFile).text();

    // Read .html content or use default
    const htmlContent = (await Bun.file(htmlFile).exists())
      ? await Bun.file(htmlFile).text()
      : DEFAULT_HTML;

    // Create modified .pre.ts with wrapper code
    const modifiedCode = `
        import { parseHTML } from "@tkeron/html-parser";

        const htmlPath = ${JSON.stringify(htmlFile)};
        const htmlContent = ${JSON.stringify(htmlContent)};
        const document = parseHTML(htmlContent);

        // --- Original .pre.ts code ---
        ${originalCode}

        // --- Save modified document ---
        const doctype = '<!DOCTYPE html>\\n';
        const htmlOutput = doctype + document.documentElement.outerHTML;
        await Bun.write(htmlPath, htmlOutput);
    `;

    // Overwrite .pre.ts with modified version
    await Bun.write(preFile, modifiedCode);

    // Execute the modified .pre.ts
    const proc = Bun.spawn(["bun", "run", preFile], {
      cwd: dirname(preFile),
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        TKERON_VERSION,
      },
    });

    await proc.exited;

    // Check if execution was successful
    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      const stdout = await new Response(proc.stdout).text();
      console.error(
        `\n❌ Error: Pre-rendering failed for ${preFile.split("/").pop()}`
      );
      console.error(`\n💡 File: ${preFile}`);
      if (stderr) {
        console.error(`\nError details:\n${stderr}`);
      }
      if (stdout) {
        console.error(`\nOutput:\n${stdout}`);
      }
      console.error();
      throw new Error(`Pre-rendering failed for ${preFile}`);
    }
  }

  return hasChanges;
};
