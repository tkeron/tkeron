#!/usr/bin/env bun
import { getCommands } from "@tkeron/commands";
import { build } from "./src/build";
import { develop } from "./src/develop";
import { initWrapper } from "./src/initWrapper";
import { showBanner } from "./src/banner";

// Show banner if no arguments provided
if (process.argv.length === 2) {
  await showBanner();
  process.exit(0);
}

getCommands()


    .addCommand("build")
    .addAlias("b")
    .addDescription("Build the project")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("targetDir")
    .setCallback(build)


    .commands()


    .addCommand("develop")
    .addAlias("dev")
    .addAlias("d")
    .addDescription("Start development server")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("targetDir")
    .addPositionedArgument("port")
    .addPositionedArgument("host")
    .setCallback(develop)


    .commands()


    .addCommand("init")
    .addAlias("i")
    .addDescription("Initialize a new tkeron project")
    .addPositionedArgument("projectName")
    .addOption("force")
    .setCallback(initWrapper)


    .commands().start();


