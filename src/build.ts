import { basename, join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { fileExists } from "./fileExist";
import { pageItem } from "./generateItems";
import { getDocument } from "./getDocument";
import { getFilesRecursive } from "./getFilesRecursive";
import { getOptions } from "./getOptions";
import { injectTsFile } from "./injectTsFile";
import { rnds } from "./rnd";
import { buildFront } from "./buildFront";
import { serializeDocument } from "./serializeDocument";

const backRegex = /\.back\.ts$/;
const htmlPageRegex = /\.page\.html$/;

export interface buildArguments {
    sourceDir: string;
    outputDir: string;
    hotRestart?: boolean;
    ignoreConsoleLogs?: boolean;
    ignoreErrors?: boolean;
}

export const build = async (args: buildArguments) => {
    const { hotRestart, ignoreConsoleLogs, ignoreErrors } = args;
    const { outputDir, sourceDir } = getOptions({ sourceDir: args.sourceDir, outputDir: args.outputDir });
    if (! await fileExists(sourceDir)) throw "directory does not exist";
    await mkdir(outputDir, { recursive: true });
    const pagesReady: string[] = [];

    for (const file of getFilesRecursive(sourceDir, { pattern: backRegex })) {
        const name = basename(file).replace(backRegex, "");
        const htmlFile = file.replace(backRegex, ".page.html");
        pagesReady.push(htmlFile);
        const htmlExist = await fileExists(htmlFile);
        let html = htmlExist ? await readFile(htmlFile, { encoding: "utf-8" }) : pageItem(name).html;
        const scriptId = "tmp" + rnds(25);
        html = await injectTsFile({ html, outputDir, sourceDir, tsFile: file, scriptId });
        const { document } = getDocument(html, { ignoreConsoleLogs, ignoreErrors });
        await new Promise((ok) => document.addEventListener("load", ok));
        const scriptNode = document.querySelector(`#${scriptId}`);
        if (scriptNode) document.head.removeChild(scriptNode);
        html = serializeDocument(document);
        const tsFile = htmlFile.replace(htmlPageRegex, ".page.ts");
        const outHtmlFile = file.replace(sourceDir, outputDir).replace(backRegex, ".html");
        const outTsFile = file.replace(sourceDir, outputDir).replace(backRegex, ".js");
        await buildFront({ html, outHtmlFile, hotRestart, outTsFile, scriptId: "tkeron_page_js", tsFile });
    }

    for (const file of getFilesRecursive(sourceDir, { pattern: htmlPageRegex })) {
        if (pagesReady.includes(file)) continue;
        let html = await readFile(file, { encoding: "utf-8" });
        const outHtmlFile = file.replace(sourceDir, outputDir).replace(htmlPageRegex, ".html");
        const outTsFile = file.replace(sourceDir, outputDir).replace(htmlPageRegex, ".html");
        const tsFile = file.replace(htmlPageRegex, ".page.ts");
        await buildFront({ html, outHtmlFile, hotRestart, outTsFile, scriptId: "tkeron_page_js", tsFile });
    }

    const compdate = new Date().getTime().toString();
    const compdateDir = join(outputDir, "compdate.txt");
    await writeFile(compdateDir, compdate, { encoding: "utf-8" });

};
