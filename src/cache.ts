import fs from "fs";
import crypto from "crypto";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { log } from "./log";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const save = async (name: string, query: string, response: string) => {
    if (!name) return;
    if (!query) return;
    if (!response) return;
    const hash = crypto.createHash("sha256");
    const sha256 = hash.update(query).digest("hex");
    const path = join(__dirname, `../cache`);
    if (!fs.existsSync(path)) fs.mkdirSync(path);
    name = join(path, `/${name}_${sha256}`);
    fs.writeFileSync(name, response, { encoding: "utf-8" });
};

export const get = (name: string, query: string): string | null => {
    if (!name) return null;
    if (!query) return null;
    const hash = crypto.createHash("sha256");
    const sha256 = hash.update(query).digest("hex");
    name = `${__dirname}/../cache/${name}_${sha256}`;
    if (!fs.existsSync(name)) return null;
    return fs.readFileSync(name, { encoding: "utf-8" });
};

export const clear = () => {
    const path = join(__dirname, "../cache");
    log("cleaning cache\n");
    if (fs.existsSync(path)) {
        const fls = fs.readdirSync(path, "utf-8");
        fls.forEach(f => {
            const fl = `${path}/${f}`;
            log("deleting " + fl);
            fs.unlinkSync(fl);
        });
    }
    log("\ncache cleaned");
};

export const doc = `
    clear                 Clear cache used by "save" function from cache.ts
`;










