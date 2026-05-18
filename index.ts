#!/usr/bin/env bun
import { getCommands } from "@tkeron/commands";
import { buildWrapper } from "./src/buildWrapper";
import { develop } from "./src/develop";
import { initWrapper } from "./src/initWrapper";
import { skillsWrapper } from "./src/skillsWrapper";
import { showBanner } from "./src/banner";
import packageJson from "./package.json";

if (process.argv.length === 2) {
  await showBanner();
  process.exit(0);
}

getCommands("tkeron", packageJson.version)
  .addCommand("build")
  .addAlias("b")
  .addDescription("Build the project")
  .setCallback(buildWrapper)

  .commands()

  .addCommand("develop")
  .addAlias("dev")
  .addAlias("d")
  .addDescription("Start development server")
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

  .commands()

  .addCommand("skills")
  .addDescription("Install AI agent skills into the current project")
  .addPositionedArgument("target")
  .addOption("force")
  .addOption({
    name: "dryRun",
    aliases: ["dry-run"],
    type: "boolean",
    description: "Preview what would be installed without making changes",
  })
  .setCallback(skillsWrapper)

  .commands()
  .start();
