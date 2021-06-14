import { writeFile } from "fs/promises";
import { resolve } from "path";
import { fileExists } from "./fileExist";
import { getFilesRecursive } from "./getFilesRecursive";
import { getDocument } from "./getDocument";
import { buildFront } from "./buildFront";
import { injectTsFile } from "./injectTsFile";



export const processBack = async (sourceDir: string, outDir: string, hotRestart = false) => {
    const files = [...getFilesRecursive(sourceDir, { pattern: /\.back\.ts$/ })].sort();
    const scriptId = "tmp_tkeron_script_code";
    for (const file of files) {
        const htmlPath = file.replace(/\.back\.ts$/, ".page.html");
        let html = "";
        const outfile = htmlPath.replace(sourceDir, outDir).replace(/\.page\.html$/, ".html");
        if (await fileExists(htmlPath)) {
            const result = await buildFront({ file: htmlPath, outDir, sourceDir, scriptId, tsFile: file, hotRestart });
            html = result.html;
        }
        const { document } = getDocument(html);
        await new Promise((ok) => document.addEventListener("load", ok));
        const script = document.querySelector(`#${scriptId}`);

        document.head.removeChild(script);

        html = `<!DOCTYPE html>\n${document.head.parentElement.outerHTML}`;
        const tsFile = file.replace(/\.back\.ts$/, ".page.ts");
        const outData = await injectTsFile({ html, outDir, sourceDir, tsFile, scriptId: undefined });
        await writeFile(outfile, outData, { encoding: "utf-8" });
    }
    return files.map(_ => resolve(_.replace(/\.back\.ts$/, ".page.html")));
};



