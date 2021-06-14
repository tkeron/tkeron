import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { bundleTs } from "./bundleTs";
import { fileExists } from "./fileExist";
import { injectCode } from "./injectCode";
import { injectTsFile } from "./injectTsFile";
import { pathToUrlResource } from "./pathToUrlResource";

export interface buildFrontOptions {
    file: string;
    sourceDir: string;
    outDir: string;
    hotRestart?: boolean;
    scriptId?: string;
    tsFile?: string;
}

export const buildFront = async (options: buildFrontOptions) => {
    const { hotRestart, file, outDir, sourceDir, scriptId, tsFile } = options;
    let html = await readFile(file, { encoding: "utf-8" });

    html = await injectTsFile({ scriptId, outDir, sourceDir, tsFile, html });

    const outfile = file.replace(sourceDir, outDir).replace(/\.page\.html$/, ".html");
    const dname = dirname(outfile);
    if (hotRestart === true) {
        const code = await readFile(join(__dirname, "simpleHotRestart.js"), { encoding: "utf-8" });
        html = injectCode(html, code, "hot_restart");
    }
    await mkdir(dname, { recursive: true });
    await writeFile(outfile, html, { encoding: "utf-8" });
    return { html, outfile };
};


