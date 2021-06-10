import { writeFile } from "fs/promises";
import { join } from "path";
import { libFiles } from "./libFiles.ts";



export const createModFile = async (sourceDir: string) => {
    let modFile = "";
    const modFilePath = join(sourceDir,"tklibs", "mod.ts");
    for (const file of libFiles)
        modFile += `export * from "./${file.replace(/\.ts$/, "")}";\n`;
    await writeFile(modFilePath, modFile, { encoding: "utf-8" });
};


