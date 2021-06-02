import { rm } from "fs/promises";
import { join } from "path";
import { copyDir } from "../copyDir";
import { getFilesRecursive } from "../getFilesRecursive";



const exampleDir = join(__dirname, "..", "..", "example");
const outDir = join(__dirname, "..", "..", "outDir");

beforeAll(async () => {
    await rm(outDir, { force: true, recursive: true });
});
afterAll(async () => {
    await rm(outDir, { force: true, recursive: true });
});

describe("copyDir", () => {
    it("copy example in outDir", async () => {
        await copyDir(exampleDir, outDir);
        const result = [...getFilesRecursive(outDir, { useDirectoryBase: true })].sort();
        expect(result).toMatchObject(['/comps/image.ts', '/comps/logo/logo.ts', '/comps/logo/skcustker.gif', '/docs/index.html', '/docs/index.ts', '/index.page.html', '/index.page.ts', '/tkeron.ts', '/tklibs/eventEmitter.ts', '/tklibs/extensions.d.ts', '/tklibs/tkeron.ts']);
    });
});
