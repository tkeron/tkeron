import { writeFile, mkdir, copyFile } from "fs/promises";
import { join } from "path";
import { getExtModules } from "./buildLoaders";
import { createModFile } from "./createModFile";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";
import { libFiles } from "./libFiles.ts";


export const cmdInit = async () => {
    const options = getOptions();
    await writeFile("tkeron.json", JSON.stringify(options, null, 4));
    const { sourceDir } = options;
    if (!await fileExists(sourceDir)) await mkdir(sourceDir, { recursive: true });
    const tklibs = join(sourceDir, "tklibs");
    if (!await fileExists(tklibs)) await mkdir(tklibs, { recursive: true });
    for (const file of libFiles) {
        const dest = join(tklibs, file);
        const src = join(__dirname, "..", "distFiles", file);
        await copyFile(src, dest);
    }
    await createModFile(sourceDir);
    const extModules = getExtModules();
    const extModName = join(tklibs, "extensions.d.ts");
    await writeFile(extModName, extModules, { encoding: "utf-8" });
};


