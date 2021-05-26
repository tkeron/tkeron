import { writeFile } from "fs/promises";
import { join } from "path";
import { libFiles } from "./libFiles.ts";



export const createModFile = async (sourceDir: string, extensionsOn = true) => {
    let modFile = `${extensionsOn ? "" : "//"}import "./tklibs/extensions";\n`;
    const modFilePath = join(sourceDir, "tkeron.ts");
    for (const file of libFiles)
        modFile += `export * from "./tklibs/${file.replace(/\.ts$/, "")}";\n`;
    await writeFile(modFilePath, modFile, { encoding: "utf-8" });
};


