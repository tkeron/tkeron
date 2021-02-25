import { start } from "./server";
import express from "express";
import fs from "fs";
import { getOpts } from "./getOpts";
import { condenser } from "./condenser";
import timeout from "./timeout";
import exec from "./exec";
import { getRecursiveDirs } from "./getRecursiveDirs";
import { log } from "./log";
import { getArg } from "./getArg";
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { channel } from "./channel";

const __dirname = dirname(fileURLToPath(import.meta.url));
let firstTime = true;

export const runDev = async () => {
    const dirs = getOpts();
    const nowatch = getArg("noWatch");
    const tk = join(__dirname, "./index.js");
    if (nowatch) {
        const cres = await exec(`node ${tk} build`);
        log(cres);
    } else {
        const cres = await exec(`node ${tk} build hotrestart`);
        log(cres);
    }
    const { app, listen } = await start();
    const comdate = join(dirs.outputDir, "/compdate.txt");
    const rcomdate = resolve(comdate);
    app.get("/compdate.txt", (_req, res) => {
        if (firstTime) {
            firstTime = false;
            res.sendFile(rcomdate);
            return;
        }
        const reload = channel("reload");
        reload.onMessage((m) => {
            reload.close();
            res.send("reload...");
        });
        _req.on("close", (q: any) => {
            reload.close();
        })
    });
    app.use(express.static(dirs.outputDir, { extensions: ["html"] }));
    if (!nowatch) {
        const evnt = condenser(300);
        let available = true;
        const wdirs = getRecursiveDirs(dirs.sourceDir);
        wdirs.push(dirs.sourceDir);
        const reload2 = channel("reload");
        const watch = (dir: string) => {
            fs.watch(dir, (event, file) => evnt(async () => {
                if (file === "tsconfig.json") return;
                if (!available) {
                    await timeout(300);
                    return;
                }
                available = false;
                log("\nbuilding again...");
                await exec(`node ${tk} build hotrestart`);
                reload2.postMessage("reload...");
                log("site built...\n");
                available = true;
            }));
        };
        wdirs.forEach(dir => watch(dir));
    }
    return { app, listen };
};

export const doc = `
    dev [OPTIONS]         Start a server in the port 8080 for web directory, 
                          and watch for file change on the front directory.
        OPTIONS:
        noWatch           Disable hotrestart for file change.
`;





