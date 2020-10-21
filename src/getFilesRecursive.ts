import fs from "fs";
import { join } from "path";

export const getFilesRecursive = (dir: string, extension = ".js"): string[] => {
    const reg = extension === "*" ? null : new RegExp(`\\${extension}$`);
    let res: string[] = [];
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const path = join(dir, f);
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
