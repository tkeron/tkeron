import { blueBright, bold } from "colorette";
import { program } from "commander";
import { fromBase64 } from "./base64";
import { cmdBuild } from "./cmdBuild";
import { cmdDev } from "./cmdDev";
import { cmdGenerate } from "./cmdGenerate";
import { cmdInit } from "./cmdInit";
import { getPackageJson } from "./getVersion";


export const main = (command = "tkeron", argv?: string[]) => {

    if (argv) argv = [...process.argv.slice(0, 2), ...argv];

    const { version, dependencies } = getPackageJson();
    const tkeronWord = bold(blueBright(fromBase64("ICAgX19fX19fXyAgXyAgX18gIF9fX19fICBfX19fICAgIF9fXyAgIF8gICBfCiAgfF9fICAgX198fCB8LyAvIHwgIF9fX3x8ICAgIFwgIC8gICBcIHwgXCB8IHwKICAgICB8IHwgICB8ICAgLyAgfCAgX198IHwgIF4gLyB8ICBeICB8fCAgXHwgfAogICAgIHwgfCAgIHwgfFwgXCB8IHxfX18gfCB8XCBcIHwgIHYgIHx8IHxcICB8CiAgICAgfF98ICAgfF98IFxfXHxfX19fX3x8X3wgXF9cIFxfX18vIHxffCBcX3w=")));
    const esbuildV = dependencies.esbuild.replace(/\^/, "");
    const info = `${tkeronWord}\n\n     tkeron  ${version}\n     esbuild ${esbuildV}\n`;

    if (process.argv.length === 2) {
        console["log"](info, `\n\n     type '${command} help' to see commands\n\n`);
        process.exit(0);
    }

    program.addHelpText("beforeAll", info);
    program.addHelpText("afterAll", "\n\n");

    program
        .command("init [sourceDir] [outDir]")
        .aliases(["i"])
        .description("initialize or refresh the project")
        .action(cmdInit);

    program
        .command("dev [sourceDir] [outDir] [port] [addr]")
        .aliases(["d"])
        .description(`start the local develop server\nand watch for src code changes`)
        .action(cmdDev);

    program
        .command("build [sourceDir] [outDir]")
        .aliases(["b"])
        .description("build the pages in outDir")
        .action(cmdBuild);

    program
        .command("generate [item] [path]")
        .aliases(["g"])
        .description(`create a component or page.\nExample:\n"${command} g c buttons/opaque" will generate\nthe component in @comps/buttons/opaque.ts\nand its css file.`)
        .action(cmdGenerate)
        ;


    program
        .version(version);

    if (argv) program.parse(argv);
    else program.parse();

};

