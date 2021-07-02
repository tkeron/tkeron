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
        await unlink(outTsFile);
        html = injectCode(html, tsCode, scriptId);
    }
    await mkdir(outHtmlDir, { recursive: true });
    await writeFile(outHtmlFile, html, { encoding: "utf-8" });

    return html;
};



