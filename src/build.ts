import { resolve, dirname } from "path";
import { buildDir } from "./buildDir";

export interface BuildOptions {
    sourceDir?: string;
    targetDir?: string;
}
export const build = async (options: BuildOptions) => {

    const source = await resolve(options.sourceDir || "websrc");
    const target = options.targetDir
        ? await resolve(options.targetDir)
        : await resolve(dirname(source), "webout");

    await buildDir(source, target);

};


