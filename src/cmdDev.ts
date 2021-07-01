import fastify from "fastify";
import fastifyStatic from "fastify-static";
import watch from "node-watch";
import { resolve } from "path";
import { EventEmitter } from "stream";
import { build } from "./build";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";


export const dev = async (sourceDir: string, outputDir: string, port = 5000) => {
    const opts = getOptions({ outputDir, sourceDir });
    sourceDir = opts.sourceDir;
    outputDir = opts.outputDir;
    if (! await fileExists(sourceDir)) throw `source directory doesn't exist`;
    await build({ sourceDir, outputDir, hotRestart: true });
    let building = false;
    let rebuild = false;
    const events = new EventEmitter();
    const watcher = watch(sourceDir, { recursive: true }, async (_event, _) => {
        if (building) {
            rebuild = true;
            return;
        }
        building = true;
        await build({ sourceDir, outputDir, hotRestart: true });
        if (rebuild) await build({ sourceDir, outputDir, hotRestart: true });
        events.emit("built");
        building = false;
    });
    const server = fastify();
    let lastListener = () => { };
    let firstRequest = true;
    server.get("/compdate.txt", (_request, reply) => {
        if (firstRequest) {
            firstRequest = false;
            reply.send({ reload: true });
            return;
        }
        try {
            events.removeListener("built", lastListener);
        } catch (_) { }
        lastListener = () => reply.send({ reload: true });
        events.once("built", lastListener);
    });
    server.register(fastifyStatic, { root: resolve(outputDir), extensions: ["html"] });
    try {
        server.listen(port, () => console["log"](`linstening on port ${port}`));
    } catch (_) {
        console["log"](_);
    }
    return { closeWatcher: () => watcher.close(), closeServer: () => server.close() };
};

export const cmdDev = async (sourceDir: string, outputDir: string, port = 5000) => { await dev(sourceDir, outputDir, port); }
