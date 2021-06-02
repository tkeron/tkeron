import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { cmdInit } from "../cmdInit";
import { fileExists } from "../fileExist";
import { getFilesRecursive } from "../getFilesRecursive";
import { pathToUrlResource } from "../pathToUrlResource";


const sourceDir = join(__dirname, "..", "..", "cmdInittmp");


beforeAll(async () => {
    if (await fileExists(sourceDir)) await rm(sourceDir, { force: true, recursive: true });
    await mkdir(sourceDir);
});

afterAll(async () => {
    await rm(sourceDir, { recursive: true, force: true });
});


describe("cmdInit", () => {
    it("run in sourceDir", async () => {
        await cmdInit(sourceDir);
        const result = [...getFilesRecursive(sourceDir)].map(_ => pathToUrlResource(_, sourceDir).url).sort();
        expect(result).toMatchObject(['/tkeron.ts', '/tklibs/eventEmitter.ts', '/tklibs/extensions.d.ts', '/tklibs/tkeron.ts']);
    });
});
