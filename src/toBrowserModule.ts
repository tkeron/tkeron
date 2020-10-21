import fs from "fs";
import exec from "./exec";
import { ts2js } from "./ts2js";

export const toBrowserModule = async (file: string, outDir: string, cacheBuster = true) => {
    if (!fs.existsSync(file)) return undefined;
    await exec(`tsc --module ESNext --strict true --target ESNext --skipLibCheck --esModuleInterop true --moduleResolution Classic --outDir ${outDir} ${file}`)
        .catch((_err) => {
            throw Error(`Error in TSC command\nMake sure you have TSC installed globally...\n` + JSON.stringify(_err));
        });
    ts2js(outDir, cacheBuster);
    return file;
};
