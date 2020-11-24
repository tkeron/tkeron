#!/usr/bin/env node

import fs from "fs";
import { runInit, doc as initDoc } from "./init";
import { runBuild, doc as buildDoc } from "./build";
import { runDev, doc as devDoc } from "./dev";
import { clear as runClear, doc as clearDoc } from "./cache";

import { getArg } from "./getArg";
import { fromBase64 } from "./base64";
import getVersion, { getPkg } from "./getVersion";
import { version as tkver } from "./tkeron";
import { log } from "./log";

const init: string | undefined = getArg("init");
const build: string | undefined = getArg("build");
const dev: string | undefined = getArg("dev");
const clear: string | undefined = getArg("clear");
const help: string | undefined = getArg("help");

(async () => {
    if (init) {
        await runInit();
        return;
    }
    if (build) {
        await runBuild();
        return;
    }
    if (dev) {
        await runDev();
        return;
    }
    if (clear) {
        runClear();
        return;
    }

    const tscver = getPkg()?.dependencies?.typescript?.match(/[\d\.]+/);
    const version: string = getVersion();
    const tk = fromBase64("ICAgX19fX19fXyAgXyAgX18gIF9fX19fICBfX19fICAgIF9fXyAgIF8gICBfCiAgfF9fICAgX198fCB8LyAvIHwgIF9fX3x8ICAgIFwgIC8gICBcIHwgXCB8IHwKICAgICB8IHwgICB8ICAgLyAgfCAgX198IHwgIF4gLyB8ICBeICB8fCAgXHwgfAogICAgIHwgfCAgIHwgfFwgXCB8IHxfX18gfCB8XCBcIHwgIHYgIHx8IHxcICB8CiAgICAgfF98ICAgfF98IFxfXHxfX19fX3x8X3wgXF9cIFxfX18vIHxffCBcX3w=");

    log(`\x1b[34m${tk}   \x1b[0m

   Tkeron CLI version ${version}
   Tkeron Library version ${tkver}
   Typescript version ${tscver}
   
   ${help ? "" : "Type 'tkeron help' to show commands.\n"}`);

    if (help) log(`
   COMMANDS
   ${initDoc}
   ${buildDoc}
   ${clearDoc}
   ${devDoc}
    `);
})();
