import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import { bundleTs } from "../bundleTs";
import { fileExists } from "../fileExist";


const testDir = join(process.cwd(), "tmp_bundle_ts");
const sumDir = join(testDir, "sum.ts");
const minDir = join(testDir, "min.ts");
const powDir = join(testDir, "pow.ts");
const operationsDir = join(testDir, "operations.ts");
const sumOutDir = join(testDir, "sum.js");
const minOutDir = join(testDir, "min.js");
const powOutDir = join(testDir, "pow.js");
const operationsOutDir = join(testDir, "operations.js");


beforeAll(async () => {
    if (await fileExists(testDir)) await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir);
    const sum = `
        //sum.ts
        export const sum = (a: number, b: number) => a + b;
    `;
    const min = `
        //min.ts
        export const min = (a: number, b: number) => a - b;
    `;
    const pow = `
        //pow.ts
        export const pow = (a: number, b: number) => a ** b;
    `;
    const operations = `
        //operations.ts
        import {sum} from "./sum";
        import {min} from "./min";
        import {pow} from "./pow";


        const a = 56;
        const b = 12;

        const sumResult = sum(a, b);
        // const minResult = min(a, b);
        const powResult = pow(a, b);

        console\.log(\`a + b = $\{sumResult\}\`);
        // console\.log(\`a - b = $\{minResult\}\`);
        console\.log(\`a ** b = $\{powResult\}\`);
    `;
    writeFile(sumDir, sum, { encoding: "utf-8" });
    writeFile(minDir, min, { encoding: "utf-8" });
    writeFile(powDir, pow, { encoding: "utf-8" });
    writeFile(operationsDir, operations, { encoding: "utf-8" });
});
afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
});


describe("bundleTs", () => {
    it("bundle with undefined file", async () => {
        const result = await bundleTs(undefined, sumOutDir)
            .catch(_ => _);
        expect(result).toBe("file must be defined");
    });
    it("bundle with undefined out file", async () => {
        const result = await bundleTs(sumDir, undefined)
            .catch(_ => _);
        expect(result).toBe("outfile must be defined");
    });
    it("bundle with unexistent file", async () => {
        const file = join(testDir, "unexistent.ts");
        const result = await bundleTs(file, sumOutDir)
            .catch(_ => _);
        expect(result).toBe(`file ${file} doesn't exist`);
    });
    it("bundle sum function", async () => {
        await bundleTs(sumDir, sumOutDir);
        const expected = "(()=>{var n=(e,m)=>e+m;})();";
        const result = (await readFile(sumOutDir, { encoding: "utf-8" })).trim();
        expect(result).toBe(expected);
    });
    it("bundle min function", async () => {
        await bundleTs(minDir, minOutDir);
        const expected = "(()=>{var m=(n,e)=>n-e;})();";
        const result = (await readFile(minOutDir, { encoding: "utf-8" })).trim();
        expect(result).toBe(expected);
    });
    it("bundle pow function", async () => {
        await bundleTs(powDir, powOutDir);
        const expected = "(()=>{var o=(e,n)=>e**n;})();";
        const result = (await readFile(powOutDir, { encoding: "utf-8" })).trim();
        expect(result).toBe(expected);
    });
    it("bundle operations, expecting tree shaking", async () => {
        await bundleTs(operationsDir, operationsOutDir);
        const expected = "(()=>{var n=(o,m)=>o+m;var s=(o,m)=>o**m;var t=56,r=12,e=n(t,r),u=s(t,r);console\.log(`a + b = ${e}`);console\.log(`a ** b = ${u}`);})();";
        const result = (await readFile(operationsOutDir, { encoding: "utf-8" })).trim();
        expect(result).toBe(expected);
    });
});

