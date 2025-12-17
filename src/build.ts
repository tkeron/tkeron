import { resolve, dirname, join, relative } from "path";
import { tmpdir } from "os";
import { buildDir } from "./buildDir";
import { processPre } from "./processPre";
import { processCom } from "./processCom";
import { rm, exists, mkdir, cp } from "fs/promises";

export interface BuildOptions {
    sourceDir?: string;
    targetDir?: string;
}
export const build = async (options: BuildOptions) => {

    const source = await resolve(options.sourceDir || "websrc");
    const target = options.targetDir
        ? await resolve(options.targetDir)
        : await resolve(dirname(source), "webout");
    const tempDir = join(tmpdir(), `tkeron-build-${crypto.randomUUID()}`);

    await mkdir(tempDir, { recursive: true });

    await cp(source, tempDir, { recursive: true });

    await processPre(tempDir);

    await processCom(tempDir);

    if (await exists(target)) {
        await rm(target, { recursive: true, force: true });
    }

    await buildDir(tempDir, target);

    await rm(tempDir, { recursive: true, force: true });

};


