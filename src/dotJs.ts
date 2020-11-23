import fs from "fs";
import { join } from "path";


const getFilesRecursive = (dir: string, extension = ".js"): string[] => {
    dir = dir.replace(/\/$/, "");
    const reg = extension === "*" ? null : new RegExp(`${extension}$`);
    let res: string[] = [];
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const path = `${dir}/${f}`;
        const st = fs.statSync(path);
        if (st.isDirectory()) {
            const ofls = getFilesRecursive(path, extension);
            res = res.concat(ofls);
            return;
        }
        if (!st.isFile()) return;
        if (reg && !f.match(reg)) return;
        res.push(path);
    });
    return res;
};
const getImports = (txt: string) => {
    let res: ({ imprt: string, file: string })[] = [];
    const getimp = () => txt.match(/import.*\"(.*)\"\;/);
    let ok = getimp();
    while (ok) {
        const [imprt, file] = ok;
        res.push({ imprt, file });
        txt = txt.replace(imprt, "");
        ok = getimp();
    }
    return res;
};

const fls = getFilesRecursive("./dist/");
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
    fs.writeFileSync(f2, file, { encoding: "utf-8" });
});


// const tklib = fs.readFileSync("./src/tkeron.ts", { encoding: "utf-8" });
// fs.writeFileSync("./dist/tkeron.ts", tklib, { encoding: "utf-8" });

export const libFiles = [
    "tkeron.ts",
    "channel.ts"
];

libFiles.forEach(f => {
    const srcpath = join("./src", f);
    const dstpath = join("./dist", f);
    const tklib = fs.readFileSync(srcpath, { encoding: "utf-8" });
    fs.writeFileSync(dstpath, tklib, { encoding: "utf-8" });
});


