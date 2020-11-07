import fs from "fs";
import os from "os";
import { rnds } from "./rnd";
import { join, basename, dirname } from "path";
import exec from "./exec";
import { ts2mjs } from "./ts2js";
import { getArg } from "./getArg";
import { log } from "./log";
import { getCode } from "./getCode";
import { getFilesRecursive } from "./getFilesRecursive";
import { strictRightCoincidence } from "./stringCompare";
import { tscpath } from "./tscpath";
import { fileURLToPath } from 'url';
import { copyDir } from "./copyDir";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getPaths = (outDir: string, file: string) => {
    const cur = getFilesRecursive(outDir, "*");
    const fileMjs = file.replace(/.ts$/, ".mjs");
    const filePath = cur.map(f => {
        const n = strictRightCoincidence(f, fileMjs);
        const l = f.length - n;
        return [l, f];
    }).sort((a, b) => {
        if (a[0] > b[0]) return +1;
        if (a[0] < b[0]) return -1;
        return 0;
    })[0][1];
    const baseDir = dirname(filePath as string);
    return { baseDir, filePath };
};

export const run = async (file: string) => {
    const filen = basename(file);
    const od = getArg("--outDir");
    const silence = getArg("silence");
    const outDir = od ? od : join(os.tmpdir(), `tk_${rnds(10)}_${filen}`);

    if (!fs.existsSync(file)) return undefined;
    await exec(`node ${tscpath} --module ESNext --strict true --target es2017 --skipLibCheck --esModuleInterop true --moduleResolution Node --outDir ${outDir} ${file}`)
        .catch((_err) => {
            throw Error(`¡Error!` + JSON.stringify(_err));
        });
    ts2mjs(outDir);
    const paths = getPaths(outDir, file);
    const rb = getCode("renderBack.mjs");
    const rbp = join(paths.baseDir, "renderBack.mjs");
    fs.writeFileSync(rbp, rb, { encoding: "utf-8" });
    let odfc = fs.readFileSync(paths.filePath, { encoding: "utf-8" });
    odfc = `import "./renderBack.mjs";\n${odfc}`;
    fs.writeFileSync(paths.filePath, odfc, { encoding: "utf-8" });

    const nmod = join(__dirname, "../node_modules");
    copyDir(nmod, join(outDir, "node_modules"));

    const res = await exec(`node ${paths.filePath}`);
    if (!silence) log(res);
    return res;
};


export const doc = `      
    file.ts [OPTIONS]     Build and run TypeScript files directly.

        OPTIONS           
        --outDir [path]   Save the output files in the specified directory.

        EXAMPLE:

        tkeron myFile.ts --outDir myPath
`;

