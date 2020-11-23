import fs from "fs";
import { getOpts } from "./getOpts";
import { getArg } from "./getArg";
import { getFilesRecursive } from "./getFilesRecursive";
import { copyDir } from "./copyDir";
import { prompt } from "./prompt";
import { createResourcesFile } from "./resources";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { libFiles } from "./dotJs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const runInit = async () => {
    const save = getArg("save");
    const example = getArg("example");
    const opts = getOpts();
    if (save) {
        fs.writeFileSync("tkeron.json", JSON.stringify(opts), { encoding: "utf-8" });
    }
    if (!fs.existsSync(opts.sourceDir)) fs.mkdirSync(opts.sourceDir, { recursive: true });
    if (!fs.existsSync(opts.staticDir)) fs.mkdirSync(opts.staticDir, { recursive: true });

    const putFiles = () => {
        libFiles.forEach(f => {
            const srcpath = join(__dirname, f);
            const destpath = join(opts.sourceDir, f);
            const file = fs.readFileSync(srcpath, { encoding: "utf-8" });
            fs.writeFileSync(destpath, file, { encoding: "utf-8" });
        });
        createResourcesFile(opts.sourceDir, opts.staticDir);
    };

    if (example) {
        (async () => {
            const fls = getFilesRecursive(opts.sourceDir, "*");
            if (fls.length > 1) {
                const r = await prompt("Your source directory is not empty, do you want to overwrite it? y / n\n");
                if (r !== "y") return;
            }
            const examplePath = join(__dirname, "../example");
            copyDir(examplePath, opts.sourceDir);
            const stt = join(__dirname, "../static");
            copyDir(stt, opts.staticDir);
            putFiles();
        })();
    }

    if (!example) putFiles();
};

export const doc = `
    init [OPTIONS]        Initialize tkeron in the current directory.
                          Create the source directory ("front" by default) 
                          and add the tkeron.ts library
        OPTIONS
        save              Save the tkeron.json file.
        example           create an index.html example file, and its corresponding css, ts and b.ts file.
`;

