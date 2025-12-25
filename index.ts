#!/usr/bin/env bun
import { getCommands } from "@tkeron/commands";
import { build } from "./src/build";
import { develop } from "./src/develop";
import { init } from "./src/init";
import { showBanner } from "./src/banner";

async function initWrapper(options: any) {
  try {
    await init(options);
  } catch (error: any) {
    const msg = error.message;
    
    if (msg === "Project name is required") {
      console.error("\n❌ Error: Project name is required.");
      console.error("\n💡 Usage: tk init <project-name>");
      console.error("   Example: tk init my-app\n");
    } else if (msg.includes("already exists")) {
      const projectName = msg.split('"')[1];
      console.error(`\n❌ Error: Directory "${projectName}" already exists.`);
      console.error(`\n💡 Tip: Choose a different name, use '.' for current directory, or use --force to overwrite.\n`);
    } else if (msg === "Template directory not found") {
      console.error("\n❌ Error: Template directory not found.");
      console.error("\n💡 This might be a tkeron installation issue.");
      console.error("   Try reinstalling: npm i -g tkeron\n");
    } else if (msg === "tkeron.d.ts not found") {
      console.error("\n❌ Error: Type definitions file not found.");
      console.error("\n💡 This might be a tkeron installation issue.");
      console.error("   Try reinstalling: npm i -g tkeron\n");
    } else {
      console.error(`\n❌ Error: ${msg}\n`);
    }
    process.exit(1);
  }
}

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


