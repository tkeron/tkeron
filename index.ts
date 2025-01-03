#!/usr/bin/env bun
import { getCommands } from "@tkeron/commands";
import p from "./package.json" assert { type: "json" };
import { ASCII } from "./src/ASCII";



const cmd = getCommands();

cmd.addHeaderText(ASCII)
cmd.programName = p.name;
cmd.version = p.version;


cmd.addCommand("build")
    .addDescription("Build the project in output directory")
    .addAlias("b")
    .setCallback(() => {
        console.log("Building the project...");
    });


cmd.start();
