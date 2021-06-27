import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { bundleTs } from "./bundleTs";
import { fileExists } from "./fileExist";
import { injectCode } from "./injectCode";


export interface buildFrontOptions {
    html: string;
    tsFile: string;
    outTsFile: string;
    outHtmlFile: string;
    hotRestart?: boolean;
    scriptId: string;
}


export const buildFront = async (options: buildFrontOptions) => {
    const { hotRestart, outHtmlFile, scriptId, tsFile, outTsFile } = options;
    let { html } = options;
    const outHtmlDir = dirname(outHtmlFile);
    if (hotRestart === true) {
        const code = await readFile(join(__dirname, "simpleHotRestart.js"), { encoding: "utf-8" });
        html = injectCode(html, code, "tkeron_simple_hot_restart");
    }
    if (await fileExists(tsFile)) {
        const tsCode = await bundleTs(tsFile, outTsFile);
        unlink(outTsFile);
        html = injectCode(html, tsCode, scriptId);
    }
    await mkdir(outHtmlDir, { recursive: true });
    await writeFile(outHtmlFile, html, { encoding: "utf-8" });
    return html;
};




// export const buildFront = async (options: buildFrontOptions) => {
//     const { hotRestart, file, outDir, sourceDir, scriptId, tsFile } = options;
//     let html = await readFile(file, { encoding: "utf-8" });

//     // html = await injectTsFile({ scriptId, outDir, sourceDir, tsFile, html });

//     const outfile = file.replace(sourceDir, outDir).replace(/\.page\.html$/, ".html");
//     const dname = dirname(outfile);
//     if (hotRestart === true) {
//         const code = await readFile(join(__dirname, "simpleHotRestart.js"), { encoding: "utf-8" });
//         html = injectCode(html, code, "hot_restart");
//     }
//     await mkdir(dname, { recursive: true });
//     await writeFile(outfile, html, { encoding: "utf-8" });
//     return { html, outfile };
// };

