import { dirname, join } from "path";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { bundleTs } from "./bundleTs";
import { fileExists } from "./fileExist";
import { getFilesRecursive } from "./getFilesRecursive";
import { getOptions } from "./getOptions";
import { pathToUrlResource } from "./pathToUrlResource";
import { createModFile } from "./createModFile";
import { EventEmitter } from "events";
import { injectCode } from "./injectCode";

const events = new EventEmitter();
const emitEvent = (event: buildEvents | string, detail?: string | any, error?: string | any) =>
    events.emit(event, { error, detail, event });


export const enum buildEvents {
    failed = "failed",
    canceled = "canceled",
    finished = "finished",
    bundled = "bundled"
}

export interface buildEvent {
    event: buildEvents | string;
    error: string | any;
    detail: string | any;
}

export const listenBuildEvents = (fn: (e: buildEvent) => void) => {
    events.on(buildEvents.canceled, fn);
};

export const cancelBuild = () => emitEvent("_cancel");


export const cmdBuild = async (sourceDir?: string, outDir?: string, hotRestart?: boolean) => {
    const opts = getOptions();
    if (!sourceDir) sourceDir = opts.sourceDir;
    if (!outDir) outDir = opts.outputDir;
    if (! await fileExists(sourceDir)) {
        emitEvent(buildEvents.failed, sourceDir);
        events.emit(buildEvents.failed, { error: "file doesn't exist", detail: sourceDir });
        return;
    }
    let cancel = false;
    events.on("_cancel", () => cancel = true);
    await mkdir(outDir, { recursive: true });
    await createModFile(sourceDir, false);
    const result = [];
    for (const file of getFilesRecursive(opts.sourceDir, { pattern: /\.page\.html$/ })) {
        const tsFile = file.replace(/\.\w*$/, ".ts");
        if (cancel) {
            emitEvent(buildEvents.canceled, result);
            return;
        }
        let html = await readFile(file, { encoding: "utf-8" });
        if (await fileExists(tsFile)) {
            const { resource } = pathToUrlResource(tsFile, sourceDir);
            const path = join(outDir, resource);
            const { errors } = await bundleTs(tsFile, path);
            if (errors.length) {
                emitEvent(buildEvents.failed, result, errors);
                throw errors;
            };
            const code = await readFile(path, { encoding: "utf-8" });
            await unlink(path);
            html = injectCode(html, code);
            emitEvent(buildEvents.bundled, { code, html });
        }
        const outfile = file.replace(sourceDir, outDir).replace(/\.page\.html$/, ".html");
        const dname = dirname(outfile);
        if (hotRestart === true) {
            const code = await readFile(join(__dirname, "simpleHotRestart.js"), { encoding: "utf-8" });
            html = injectCode(html, code);
        }
        await mkdir(dname, { recursive: true });
        await writeFile(outfile, html, { encoding: "utf-8" });
    }
    await createModFile(sourceDir);
    const compdate = new Date().getTime().toString();
    const compdateDir = join(outDir, "compdate.txt");
    await writeFile(compdateDir, compdate, { encoding: "utf-8" });
    emitEvent(buildEvents.finished, result);
};
