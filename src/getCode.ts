import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getCode = (name: string) => {
    const path = join(__dirname, name);
    if (!fs.existsSync(path)) return "";
    return fs.readFileSync(path, { encoding: "utf-8" });
};

