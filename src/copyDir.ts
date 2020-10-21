import fs from "fs";
import { join } from "path";
import { getFilesRecursive } from "./getFilesRecursive";
import { getRecursiveDirs } from "./getRecursiveDirs";


export const copyDir = (path: string, dest: string) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const dirs = getRecursiveDirs(path).map(d => {
        d = join(dest, d.slice(path.length));
        return d;
    });
    dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
    const files = getFilesRecursive(path, "*");
    files.forEach((f) => {
        const fn = f.slice(path.length);
        const fnto = join(dest, fn);
        const fl = fs.readFileSync(f);
        fs.writeFileSync(fnto, fl);
    });
};
