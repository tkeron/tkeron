// import { join, resolve } from "path";
// import { writeFile, mkdir } from "fs/promises";
// import { fileExists } from "./fileExist";
// import { getFilesRecursive } from "./getFilesRecursive";
// import { getOptions } from "./getOptions";
// import { EventEmitter } from "events";
// import { processBack } from "./processBack";
// import { buildFront } from "./buildFront";

// const events = new EventEmitter();
// const emitEvent = (event: buildEvents | string, detail?: string | any, error?: string | any) =>
//     events.emit(event, { error, detail, event });

// export const enum buildEvents {
//     failed = "failed",
//     canceled = "canceled",
//     finished = "finished",
//     bundled = "bundled"
// }

// export interface buildEvent {
//     event: buildEvents | string;
//     error: string | any;
//     detail: string | any;
// }

// export const listenBuildEvents = (fn: (e: buildEvent) => void) => {
//     events.on(buildEvents.canceled, fn);
// };

// export const cancelBuild = () => emitEvent("_cancel");

// export const cmdBuild = async (sourceDir?: string, outDir?: string, hotRestart?: boolean, production = true) => {
//     const opts = getOptions();
//     if (!sourceDir) sourceDir = opts.sourceDir;
//     sourceDir = resolve(sourceDir);
//     if (!outDir) outDir = opts.outputDir;
//     outDir = resolve(outDir);
//     if (! await fileExists(sourceDir)) {
//         emitEvent(buildEvents.failed, sourceDir);
//         return;
//     }
//     let cancel = false;
//     events.on("_cancel", () => cancel = true);
//     await mkdir(outDir, { recursive: true });
//     const result = [];
//     const backs = await processBack(sourceDir, outDir, hotRestart, production);
//     for (const file0 of getFilesRecursive(sourceDir, { pattern: /\.page\.html$/ })) {
//         const file = resolve(file0);
//         if (backs.includes(file)) continue;
//         const tsFile = file.replace(/\.\w*$/, ".ts");
//         await buildFront({ file, hotRestart, sourceDir, outDir, tsFile });
//     }
//     const compdate = new Date().getTime().toString();
//     const compdateDir = join(outDir, "compdate.txt");
//     await writeFile(compdateDir, compdate, { encoding: "utf-8" });
//     emitEvent(buildEvents.finished, result);
// };
