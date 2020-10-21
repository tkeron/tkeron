import fs from "fs";
import { join, normalize } from "path";
import os from "os";
import { getArg } from "./getArg";
import { getImports } from "./imports";
import { exec } from "./exec";
import { log } from "./log";


export const runBundle = async () => {


    const src = getArg("--src") || normalize("./src");
    const out = getArg("--out") || normalize("./out");
    const outFile = getArg("--file") || "out.ts";

    const pre = join(os.tmpdir(), outFile);

    const fls = fs.readdirSync(src, { encoding: "utf-8" })?.sort((a, b) => a === b ? 0 : (a < b ? -1 : 1));

    let res = fls.reduce((p, c) => {
        const exclude = c.match(/^\_{2}/);
        if (exclude) return p;
        const fp = join(src, c);
        let f = fs.readFileSync(fp, { encoding: "utf-8" });
        const include = f.match(/\/{2}\_{2}(.*)\_{2}/g)?.map(_ => _.slice(4, _.length - 2));
        if (include) {
            include.forEach(i => {
                const inf = fs.readFileSync(join(src, i), { encoding: "utf-8" });
                f = f.replace(`//_${""}_${i}__`, inf);
            })
        }
        p += f;
        return p;
    }, "");

    const imprts = getImports(res);

    const imps = imprts.reduce((p, c) => {
        res = res.replace(c.imprt, "");
        p += `${c.imprt}\n`;
        return p;
    }, "");

    res = `${imps}\n(() => {\n${res}\n})();`;

    fs.writeFileSync(pre, res, { encoding: "utf-8" });

    await exec(`tsc --allowJs true --esModuleInterop true --moduleResolution node  --module ESNext --target ESNext --outDir ${out} ${pre}`)
        .then(log)
        .catch(log);
    fs.unlinkSync(pre);


};

export const doc = `
    bundle [OPTIONS]      Join ts files in a directory and output a single js file.
        OPTIONS
        --src <path>      Source directory with ts files. "src" by default.
        --out <path>      Output directory, "out" by default.
        --file <name>     Name of the output file, "out.js" by default.
`;

