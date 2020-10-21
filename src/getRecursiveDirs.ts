import fs from "fs";
import { join } from "path";

export const getRecursiveDirs = (dir: string) => {
    let res: string[] = [];
    const dirs = fs.readdirSync(dir);
    dirs.forEach((d) => {
        const path = join(dir, d);
        const st = fs.statSync(path);
        const isDir = st.isDirectory();
        if (!isDir) return;
        const rdirs = getRecursiveDirs(path);
        res = [...res, path, ...rdirs];
    });
    return res;
};

