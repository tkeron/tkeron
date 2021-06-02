import { rm } from "fs/promises";
import { join } from "path";
import { build, closeDev, closeEvents, cmdDev, setLogger } from "../cmdDev";
import { cmdInit } from "../cmdInit";
import { copyDir } from "../copyDir";
import { fileExists } from "../fileExist";


const sourceRoot = join(__dirname, "..", "..", "cmdDevtmp");
const sourceDir = join(__dirname, "..", "..", "cmdDevtmp", "src");
const sourceDirTklibs = join(__dirname, "..", "..", "cmdDevtmp", "src", "tklibs");
const outDir = join(__dirname, "..", "..", "cmdDevtmp", "out");
const exampleDir = join(__dirname, "..", "..", "example");

beforeAll(async () => {
    if (await fileExists(sourceDir)) await rm(sourceDir, { force: true, recursive: true });
    await copyDir(exampleDir, sourceDir);
    await cmdInit(sourceDir);
    setLogger(() => { });
});

afterAll(async () => {
    await rm(sourceRoot, { recursive: true, force: true });
    closeDev();
    closeEvents();
});

describe("cmdDev", () => {
    it("run in sourceDir", async () => {
        await cmdDev(sourceDir, outDir);
    });
    it("run in current directory", async () => {
        await cmdDev(undefined, undefined);
    });
    it("run in unexistent directory", async () => {
        expect.assertions(1);
        try {
            await cmdDev("qwerty/asdf", undefined);
        } catch (_) {
            expect(_).toMatch("source directory doesn't exist");
        }
    });
    it("build overflow", async () => {
        await Promise.all([
            build(sourceDir, outDir),
            build(sourceDir, outDir),
            build(sourceDir, outDir),
            build(sourceDir, outDir),
            build(sourceDir, outDir),
        ]);
    });
    it("error in build", async () => {
        await rm(sourceDirTklibs, { recursive: true, force: true });
        expect.assertions(1);
        try {
            await cmdDev(sourceDir, outDir);
        } catch (_) {
            expect(JSON.stringify(_)).toMatch("error");
        }
    });

});


