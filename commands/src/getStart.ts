import { CommandsCollection } from "./types";

export const getStart =
  (commandsCollection: CommandsCollection) => (argv?: string[]) => {
    if (!argv) argv = process.argv;
    if (!Array.isArray(argv)) throw new Error("no arguments passed");
    if (argv.length < 2) throw Error("arguments out of range");
    argv = argv.slice(2);
    if (argv.length === 0) {
      commandsCollection.help.callback();
      return;
    }

    const commandName = argv[0];

    const command = commandsCollection[commandName];
    if (!command) {
      console["log"](`command '${commandName}' not found`);
      return;
    }

    const options = argv
      .slice(1)
      .filter((arg) => /\=/g.test(arg))
      .map((arg) => arg.split("="))
      .reduce((p, c) => {
        p[c[0]] = c[1];

        return p;
      }, {});

    const positionedArgsValues = argv
      .slice(1)
      .filter((arg) => !/\=/g.test(arg));

    if (positionedArgsValues.length <= command.positionedArguments.length) {
      positionedArgsValues.forEach(
        (arg, n) => (options[command.positionedArguments[n]] = arg)
      );
    }

    if (positionedArgsValues.length > command.positionedArguments.length) {
      console["log"](
        `argument${
          positionedArgsValues.length - command.positionedArguments.length === 1
            ? ""
            : "s"
        } '${positionedArgsValues
          .slice(command.positionedArguments.length)
          .join(", ")}' not defined`
      );
      return;
    }

    command.callback(options);
  };
