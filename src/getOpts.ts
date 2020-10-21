import fs from "fs";
import { getArg } from "./getArg";

export interface tkeronOpts {
    sourceDir: string;
    outputDir: string;
    staticDir: string;
}

export const getOpts = (): tkeronOpts => {
    const fok = fs.existsSync("./tkeron.json");
    const opt: tkeronOpts = fok ? JSON.parse(fs.readFileSync("./tkeron.json", { encoding: "utf-8" })) : {
        sourceDir: "front",
        outputDir: "web",
        staticDir: "static"
    };

    const sourceDir = getArg("source") || opt.sourceDir;
    const outputDir = getArg("output") || opt.outputDir;
    const staticDir = getArg("static") || opt.staticDir;

    return { sourceDir, outputDir, staticDir } as tkeronOpts;
};
