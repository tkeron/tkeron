import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { bundleTs } from "./bundleTs";
import { fileExists } from "./fileExist";
import { injectCode } from "./injectCode";
import { pathToUrlResource } from "./pathToUrlResource";

export interface injectTsFileOptions {
    tsFile: string;
    sourceDir: string;
    outputDir: string;
    html: string;
    scriptId: string;
}


export const injectTsFile = async (options: injectTsFileOptions) => {
    const { tsFile, sourceDir, outputDir, scriptId } = options;
    if (!await fileExists(tsFile)) throw `file ${tsFile} does not exist`;
    let { html } = options;
    const { resource } = pathToUrlResource(tsFile, sourceDir);
    const path = join(outputDir, resource);
    const code = await bundleTs(tsFile, path);
    await unlink(path);
    html = injectCode(html, code, scriptId);
    return html;
};





// export const injectTsFile = async (options: injectTsFileOptions) => {
//     const { tsFile, sourceDir, outDir, scriptId } = options;
//     let { html } = options;
//     if (tsFile && await fileExists(tsFile)) {
//         const { resource } = pathToUrlResource(tsFile, sourceDir);
//         const path = join(outDir, resource);
//         const { errors } = await bundleTs(tsFile, path);
//         if (errors.length) throw errors;
//         const code = await readFile(path, { encoding: "utf-8" });
//         await unlink(path);


//         html = injectCode(html, code, scriptId);



//     }
//     return html;
// };



