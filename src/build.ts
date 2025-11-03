import { resolve, dirname } from "path";
import { buildDir } from "./buildDir";
import { rm, exists } from "fs/promises";

export interface BuildOptions {
    sourceDir?: string;
    targetDir?: string;
}
export const build = async (options: BuildOptions) => {

    const source = await resolve(options.sourceDir || "websrc");
    const target = options.targetDir
        ? await resolve(options.targetDir)
        : await resolve(dirname(source), "webout");

    if (await exists(target)) {
        await rm(target, { recursive: true, force: true });
    }

    await buildDir(source, target);

};


