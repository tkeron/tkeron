import { getPaths } from "@tkeron/tools";
import { resolve, join, dirname } from "path";
import { buildFile } from "./buildFile";

export interface BuildOptions {
    sourceDir?: string;
    targetDir?: string;
}
export const build = async (options: BuildOptions) => {

    const source = await resolve(options.sourceDir || "websrc");
    const target = options.targetDir
        ? await resolve(options.targetDir)
        : await resolve(dirname(source), "webout");

    const htmlFiles = await getPaths(source, "**/*.html", "no", true);

    const files = await buildFile(htmlFiles, source);

    for (const a of files?.artifacts || []) {
        await Bun.write(join(target, a.pathR), a.artifact, { createPath: true });
    }

};


