import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";
import { libFiles } from "./libFiles";

const __dirname = dirname(fileURLToPath(import.meta.url));

libFiles.forEach(f => {
    const srcpath = join(__dirname, "../src", f);
    const destpath = join(__dirname, f);
    const file = fs.readFileSync(srcpath, { encoding: "utf-8" });
    fs.writeFileSync(destpath, file, { encoding: "utf-8" });
});
