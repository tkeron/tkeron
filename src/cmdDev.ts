import fastify from "fastify";
import fastifyStatic from "fastify-static";
import watch from "node-watch";
import { resolve, join } from "path";
import { cmdBuild, cancelBuild } from "./cmdBuild";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";


export const cmdDev = async (sourceDir: string, outDir: string) => {
    const opts = getOptions();
    if (!sourceDir) sourceDir = opts.sourceDir;
    if (!outDir) outDir = opts.outputDir;
    if (! await fileExists(sourceDir)) throw `source directory doesn't exist`;

    await cmdBuild(sourceDir, outDir, true);

    watch(sourceDir, { recursive: true }, async (_event, name) => {
        const exceptionFiles: string[] = [join(sourceDir, "tkeron.ts")];
        const namePath = join(name);
        if (exceptionFiles.includes(namePath)) return;
        console["log"]("building...\n");
        cancelBuild();
        await cmdBuild(sourceDir, outDir, true);
        console["log"]("site built\n");
    });

    const server = fastify();
    server.register(fastifyStatic, { root: resolve(outDir), extensions: ["html"] });
    try {
        server.listen(5000, () => {
            console["log"]("linstening on port 5000");
        });
    } catch (_) {
        console.log(_);
    }
};






