import { join, dirname } from "path";
import { getFilePaths } from "@tkeron/tools";

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

export const processPre = async (tempDir: string) => {
    // Find all .pre.ts files
    const preFiles = getFilePaths(tempDir, "**/*.pre.ts", true);

    for (const preFile of preFiles) {
        // Get corresponding .html file path
        const htmlFile = preFile.replace(/\.pre\.ts$/, ".html");
        
        // Read original .pre.ts content
        const originalCode = await Bun.file(preFile).text();
        
        // Read .html content or use default
        const htmlContent = await Bun.file(htmlFile).exists()
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
            stdout: "inherit",
            stderr: "inherit",
        });
        
        await proc.exited;
    }
};
