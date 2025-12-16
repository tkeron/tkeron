#!/usr/bin/env bun
import { getCommands } from "@tkeron/commands";
import { build } from "./src/build";
import { develop } from "./src/develop";

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


    .commands().start();


