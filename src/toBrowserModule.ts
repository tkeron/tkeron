import fs from "fs";
import exec from "./exec";
import { ts2js } from "./ts2js";
import { tscpath } from "./tscpath";

export const toBrowserModule = async (file: string, outDir: string, cacheBuster = true) => {
    if (!fs.existsSync(file)) return undefined;
    await exec(`node ${tscpath} --module ESNext --strict true --target es2017 --skipLibCheck --esModuleInterop true --moduleResolution Classic --outDir ${outDir} ${file}`)
        .catch((_err) => {
            throw Error(`¡Error!` + JSON.stringify(_err));
        });
    ts2js(outDir, cacheBuster);
    return file;
};
