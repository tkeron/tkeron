import { join } from "path";
import { mkdir, readFile, rm } from "fs/promises";
import { createModFile } from "../createModFile";

const sourceDir = join(__dirname, "..", "..", "cmftempdir");

beforeAll(async () => {
    await mkdir(sourceDir);
});
afterAll(async () => {
    await rm(sourceDir, { recursive: true, force: true });
});


describe("createModFile", () => {
    it("create mod file", async () => {
        await createModFile(sourceDir);
        const expected = `import "./tklibs/extensions";\nexport * from "./tklibs/tkeron";\nexport * from "./tklibs/eventEmitter";\n`;
        const filePath = join(sourceDir, "tkeron.ts");
        const fileData = await readFile(filePath, { encoding: "utf-8" });
        expect(fileData).toBe(expected);
    });
});


