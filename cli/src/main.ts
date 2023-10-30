import { getCommands } from "@tkeron/commands";
import { blueBright, bold } from "colorette";
import { fromBase64 } from "./base64";
import { cmdBuild } from "./cmdBuild";
import { cmdDev } from "./cmdDev";
import { cmdGenerate } from "./cmdGenerate";
import { cmdInit } from "./cmdInit";
import { getPackageJson } from "./getVersion";

const log = console.log;
console.log = (...args: any) => {
  if (process.env.NODE_ENV === "test") return;
  log(...args);
};

export const main = (command = "tkeron", argv?: string[]) => {
  if (argv) argv = [...process.argv.slice(0, 2), ...argv];

  const { version, dependencies } = getPackageJson();
  const tkeronWord = bold(
    blueBright(
      fromBase64(
        "ICAgX19fX19fXyAgXyAgX18gIF9fX19fICBfX19fICAgIF9fXyAgIF8gICBfCiAgfF9fICAgX198fCB8LyAvIHwgIF9fX3x8ICAgIFwgIC8gICBcIHwgXCB8IHwKICAgICB8IHwgICB8ICAgLyAgfCAgX198IHwgIF4gLyB8ICBeICB8fCAgXHwgfAogICAgIHwgfCAgIHwgfFwgXCB8IHxfX18gfCB8XCBcIHwgIHYgIHx8IHxcICB8CiAgICAgfF98ICAgfF98IFxfXHxfX19fX3x8X3wgXF9cIFxfX18vIHxffCBcX3w="
      )
    )
  );
  const esbuildV = dependencies.esbuild.replace(/\^/, "");
  const info = `${tkeronWord}\n\n     tkeron  ${version}\n     esbuild ${esbuildV}\n`;

  if (process.argv.length === 2) {
    console["log"](info, `\n\n     type '${command} help' to see commands\n\n`);
    return;
  }

  getCommands()
    .addCommand("init")
    .addAlias("i")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("outputDir")
    .setCallback(cmdInit)

    .commands()

    .addCommand("dev")
    .addAlias("d")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("outputDir")
    .addPositionedArgument("port")
    .addPositionedArgument("addr")
    .setCallback(cmdDev)

    .commands()

    .addCommand("build")
    .addAlias("b")
    .addPositionedArgument("sourceDir")
    .addPositionedArgument("outputDir")
    .setCallback(cmdBuild)

    .commands()

    .addCommand("generate")
    .addAlias("g")
    .addPositionedArgument("item")
    .addPositionedArgument("path")
    .setCallback(cmdGenerate)

    .commands()

    .start();
};
