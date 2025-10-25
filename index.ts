import { getCommands } from "@tkeron/commands";
import { build } from "./src/build";

getCommands()



    .addCommand("build")
    .addAlias("b")
    .addDescription("Build the project")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("targetDir")
    .setCallback(build)


    .commands().start();


