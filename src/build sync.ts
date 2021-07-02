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
import { wait } from "./wait";

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
    const backFiles = [...getFilesRecursive(sourceDir, { pattern: backRegex })];

    console.time("build");

    for (const file of backFiles) {
        const name = basename(file).replace(backRegex, "");
        const htmlFile = file.replace(backRegex, ".page.html");
        pagesReady.push(htmlFile);
        const htmlExist = await fileExists(htmlFile);
        let html = htmlExist ? await readFile(htmlFile, { encoding: "utf-8" }) : pageItem(name).html;
        const scriptId = "tmp" + rnds(25);
        html = await injectTsFile({ html, outputDir, sourceDir, tsFile: file, scriptId });
        const { document, jsDomErrors, window } = getDocument(html, { ignoreConsoleLogs, ignoreErrors });
        if (ignoreErrors && jsDomErrors.length) jsDomErrors.forEach((_: any) => console["log"](`page ${name} error: `, _.detail || _));
        await new Promise((ok) => {
            const handle = setTimeout(() => {
                console["log"](`time up: ${name}`);
                ok(0);
            }, 3e3);
            document.addEventListener("load", () => {
                clearTimeout(handle);
                ok(0);
            });
        });
        const scriptNode = document.querySelector(`#${scriptId}`);
        if (scriptNode) document.head.removeChild(scriptNode);
        html = serializeDocument(document);
        window.close();
        const tsFile = htmlFile.replace(htmlPageRegex, ".page.ts");
        const outHtmlFile = file.replace(sourceDir, outputDir).replace(backRegex, ".html");
        const outTsFile = file.replace(sourceDir, outputDir).replace(backRegex, ".js");
        console["log"](`building ${name}`);
        let ok = await tryBuildFront(html, outHtmlFile, hotRestart, outTsFile, "tkeron_page_js", tsFile);
        while (!ok) {
            await wait();
            console["log"](`retry building ${name}`);
            ok = await tryBuildFront(html, outHtmlFile, hotRestart, outTsFile, "tkeron_page_js", tsFile);
        }
        console["log"](`${name} built`);
    }
    const htmlFiles = [...getFilesRecursive(sourceDir, { pattern: htmlPageRegex })];
    for (const file of htmlFiles) {
        const name = basename(file).replace(htmlPageRegex, "");
        if (pagesReady.includes(file)) continue;
        let html = await readFile(file, { encoding: "utf-8" });
        const outHtmlFile = file.replace(sourceDir, outputDir).replace(htmlPageRegex, ".html");
        const outTsFile = file.replace(sourceDir, outputDir).replace(htmlPageRegex, ".html");
        const tsFile = file.replace(htmlPageRegex, ".page.ts");

        console["log"](`building ${name}`);
        let ok = await tryBuildFront(html, outHtmlFile, hotRestart, outTsFile, "tkeron_page_js", tsFile);
        while (!ok) {
            await wait();
            console["log"](`retry building ${name}`);
            ok = await tryBuildFront(html, outHtmlFile, hotRestart, outTsFile, "tkeron_page_js", tsFile);
        }
        console["log"](`${name} built`);
    }

    const compdate = new Date().getTime().toString();
    const compdateDir = join(outputDir, "compdate.txt");
    await writeFile(compdateDir, compdate, { encoding: "utf-8" });

    console.timeEnd("build");

    console["log"]("\nall site built");
};


export const tryBuildFront = async (html: string, outHtmlFile: string, hotRestart: boolean, outTsFile: string, scriptId: string, tsFile: string): Promise<boolean> => {
    return new Promise(async (ok) => {
        try {
            await buildFront({ html, outHtmlFile, hotRestart, outTsFile, scriptId: "tkeron_page_js", tsFile });
            ok(true);
        } catch (_) {
            ok(false);
        }
    });
};
