// import { readFile, writeFile } from "fs/promises";
// import { resolve } from "path";
// import { fileExists } from "./fileExist";
// import { getFilesRecursive } from "./getFilesRecursive";
// import { getDocument } from "./getDocument";
// import { buildFront } from "./buildFront";
// import { injectTsFile } from "./injectTsFile";
// import { serializeDocument } from "./serializeDocument";

// export interface processBackFileArguments {
//     sourceDir: string;
//     outDir: string;
//     hotRestart: boolean;
//     file: string;
//     scriptId: string;
//     ignoreConsoleLogs?: boolean;
//     ignoreErrors?: boolean;
// }

// export const processBackFile = async (args: processBackFileArguments) => {
//     const { hotRestart, outDir, sourceDir, file, scriptId, ignoreErrors, ignoreConsoleLogs } = args;
//     const htmlPath = file.replace(/\.back\.ts$/, ".page.html");
//     let html = "";
//     const outfile = htmlPath.replace(sourceDir, outDir).replace(/\.page\.html$/, ".html");

//     // if (await fileExists(htmlPath)) {
//     //     const result = await buildFront({ file: htmlPath, outDir, sourceDir, scriptId, tsFile: file, hotRestart });
//     //     html = result.html;
//     // }

//     if (await fileExists(htmlPath)) {
//         html = await readFile(htmlPath, { encoding: "utf-8" });
//     }

//     const { document } = getDocument(html, { ignoreConsoleLogs, ignoreErrors });
//     await new Promise((ok) => document.addEventListener("load", ok));
//     // const script = document.querySelector(`#${scriptId}`);
//     // if (script) document.head.removeChild(script);

//     html = serializeDocument(document);
//     const tsFile = file.replace(/\.back\.ts$/, ".page.ts");
//     const outData = await injectTsFile({ html, outDir, sourceDir, tsFile, scriptId: undefined });
//     await writeFile(outfile, outData, { encoding: "utf-8" });
//     await buildFront({ file: outfile, outDir, sourceDir, scriptId, tsFile: file, hotRestart });
// };

// export const processBack = async (sourceDir: string, outDir: string, hotRestart = false, production = false) => {
//     const files = [...getFilesRecursive(sourceDir, { pattern: /\.back\.ts$/ })].sort();
//     const scriptId = "tmp_tkeron_script_code";
//     for (const file of files) await processBackFile({ scriptId, sourceDir, outDir, hotRestart, file, ignoreErrors: !!production, ignoreConsoleLogs: !!production });
//     return files.map(_ => resolve(_.replace(/\.back\.ts$/, ".page.html")));
// };



