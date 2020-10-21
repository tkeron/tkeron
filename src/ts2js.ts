import fs from "fs";
import { getFilesRecursive } from "./getFilesRecursive";
import { getImports } from "./imports";



export const ts2mjs = (dir: string) => {
    const fls = getFilesRecursive(dir);
    fls.forEach(f => {
        let file = fs.readFileSync(f, { encoding: "utf-8" });
        const imprts = getImports(file);
        Object.values(imprts).forEach(o => {
            const isFile = o.file.match(/^\.{1,2}\/\w+/) ? true : false;
            const hasExt = o.file.match(/^\.{1,2}\/\w+(\.mjs)$/) ? true : false;
            if (isFile && !hasExt) {
                const replace = o.imprt.replace(o.file, o.file + ".mjs");
                file = file.replace(o.imprt, replace);
            }
        });
        const f2 = f.replace(/\.js/, ".mjs");
        fs.renameSync(f, f2);
        fs.writeFileSync(f2, file, { encoding: "utf-8" })
    });
};

export const ts2js0 = (dir: string, cacheBuster = true) => {
    const fls = getFilesRecursive(dir);
    const cb = cacheBuster ? `?cb=${(new Date()).getTime()}` : "";
    fls.forEach(f => {
        let file = fs.readFileSync(f, { encoding: "utf-8" });
        const imports = file.match(/['"]\.{0,2}\/{0,1}.*(?<!\.js)['"]\;/g);
        if (!imports) {
            return;
        }
        imports.forEach(im => {
            // const replc = im.replace(/['"]\;/g, ".js\";").replace(/\'/g, "\"");
            const replc = im.replace(/['"]\;/g, `.js${cb}";`).replace(/\'/g, "\"");
            const reg = new RegExp(im, "g");
            file = file.replace(reg, replc);
        });
        fs.writeFileSync(f, file, { encoding: "utf-8" })
    });
};



export const ts2js = (dir: string, cacheBuster = true) => {
    const fls = getFilesRecursive(dir);
    const cb = cacheBuster ? `?cb=${(new Date()).getTime()}` : "";
    fls.forEach(f => {
        let file = fs.readFileSync(f, { encoding: "utf-8" });
        const imprts = getImports(file);
        Object.values(imprts).forEach(o => {
            const isFile = o.file.match(/^\.{1,2}\/\w+/) ? true : false;
            const hasExt = o.file.match(/^\.{1,2}\/\w+(\.js)$/) ? true : false;
            if (isFile && !hasExt) {
                const replace = o.imprt.replace(o.file, o.file + `.js${cb}`);
                file = file.replace(o.imprt, replace);
            }
        });
        fs.writeFileSync(f, file, { encoding: "utf-8" })
    });
};


