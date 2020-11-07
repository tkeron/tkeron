import fs from "fs";


export const isDir = (path: string) => {
    const st = fs.statSync(path);
    return st.isDirectory();
};