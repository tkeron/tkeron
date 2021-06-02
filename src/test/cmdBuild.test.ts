import { mkdir, rm, copyFile } from "fs/promises";
import { join } from "path";
import { cmdBuild } from "../cmdBuild";
import { cmdInit } from "../cmdInit";
import { fileExists } from "../fileExist";
import { getFilesRecursive } from "../getFilesRecursive";
import { pathToUrlResource } from "../pathToUrlResource";


const sourceDir = join(__dirname, "..", "..", "example");
const outDir = join(__dirname, "..", "..", "cmdOutBuildtmp");


beforeAll(async () => {
    if (await fileExists(outDir)) await rm(outDir, { force: true, recursive: true });
    await cmdInit(sourceDir);
});

afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
});

describe("cmdBuild", () => {
    it("run in sourceDir", async () => {
        await cmdBuild(sourceDir, outDir);
        const result = [...getFilesRecursive(outDir)].map(_ => pathToUrlResource(_, outDir).url).sort();
        expect(result).toMatchObject(['/compdate.txt', '/index.html', '/skcustker-5M6I2VE7.gif']);
    });
});
