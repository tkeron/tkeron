import { copyFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileExists } from "./fileExist";
import { getFilesRecursive } from "./getFilesRecursive";


export const copyDir = async (sourceDir: string, outputDir: string) => {
    for (const file of getFilesRecursive(sourceDir, { useDirectoryBase: true })) {
        const sourcePath = join(sourceDir, file);
        const outPath = join(outputDir, file);
        const dir = dirname(outPath);
        if (!await fileExists(dir)) await mkdir(dir, { recursive: true });
        await copyFile(sourcePath, outPath);
    }
};

