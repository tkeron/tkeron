import EventEmitter from "events";
import fastify from "fastify";
import fastifyStatic from "fastify-static";
import watch from "node-watch";
import { resolve, join } from "path";
import { cmdBuild, cancelBuild, listenBuildEvents, buildEvents } from "./cmdBuild";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";


const events = new EventEmitter();

let building = false;
let buildPending = false;

let logger = console["log"];

export const setLogger = (loggerFunc: (...pars: any) => void) => logger = loggerFunc;

export const closeDev = () => events.emit("close");

export const closeEvents = () => events.removeAllListeners();

export const build = async (sourceDir: string, outDir: string) => {
    if (building) {
        buildPending = true;
        cancelBuild();
        return;
    }
    logger("building...\n");
    buildPending = false;
    building = true;
    await cmdBuild(sourceDir, outDir, true);
    building = false;
    logger("site built\n");
};


export const cmdDev = async (sourceDir: string, outDir: string) => {
    const opts = getOptions();
    if (!sourceDir) sourceDir = opts.sourceDir;
    if (!outDir) outDir = opts.outputDir;
    if (! await fileExists(sourceDir)) throw `source directory doesn't exist`;

    await build(sourceDir, outDir);


    listenBuildEvents(async (e) => {
        const { event } = e;
        if (event === buildEvents.bundled) return;
        building = false;
        if (buildPending) await build(sourceDir, outDir);
    });

    const watcher = watch(sourceDir, { recursive: true }, async (_event, name) => {
        const exceptionFiles = [join(sourceDir, "tkeron.ts")];
        const namePath = join(name);
        if (exceptionFiles.includes(namePath)) return;
        await build(sourceDir, outDir);
    });

    const server = fastify();
    server.register(fastifyStatic, { root: resolve(outDir), extensions: ["html"] });

    events.on("close", () => {
        watcher.close();
        server.close();
    });

    try {
        server.listen(5000, () => {
            logger("linstening on port 5000");
        });
    } catch (_) {
        logger(_);
    }
};
