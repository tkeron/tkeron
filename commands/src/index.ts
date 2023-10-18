export interface CommandHandler {
  name: string;
  aliases: string[];
  options: string[];
  callback: Callback;
}

export type Options = { [key: string]: CommandHandler };
export type parsedOptions = { [key: string]: string };

export type Callback = (options: parsedOptions) => void;

export interface Command {
  name: string;
  next: () => Commands;
  addAliases: (...alias: string[]) => Command;
  addOptions: (...options: string[]) => Command;
  addPositionedArgument: (arg: string) => Command;
  setCallback: (callback: Callback) => Command;
}

export interface Commands {
  addCommand: (commandName: string) => Command;
  run: () => void;
}

const _commands: Options = {};
const orderedArgumentNames: string[] = [];

const run = () => {
  const currentCommands = process.argv.slice(2);
  const parsedOptions = currentCommands
    .join(" ")
    .match(/(\w+[:=]\w+)/g)
    ?.reduce((p, c) => {
      const [k, v] = c.split(/[:=]/);
      p[k] = v;
      return p;
    }, {});
  const orderedArguments = currentCommands?.filter((c) => !/[:=-]/g.test(c));
  if (
    orderedArguments &&
    orderedArguments.length &&
    Object.keys(_commands).includes(orderedArguments[0])
  )
    orderedArguments.shift();
  const orderedOptions = {};
  if (
    orderedArguments &&
    orderedArguments.length > 0 &&
    orderedArgumentNames.length === orderedArguments.length
  ) {
    orderedArgumentNames.forEach((key, n) => {
      orderedOptions[key] = orderedArguments[n];
    });
  }

  for (const commandIndex of currentCommands) {
    const command: CommandHandler = _commands[commandIndex];
    if (!command) continue;
    const options = {
      ...orderedOptions,
      ...(parsedOptions && command.options
        ? command.options.reduce((p, c) => {
            p[c] = parsedOptions[c];
            return p;
          }, {})
        : {}),
    };

    command.callback(options);
  }
};

export const getCommands = (): Commands => {
  const commands: Commands = {
    run,
    addCommand: undefined,
  };

  commands.addCommand = (name: string) => {
    const command: Command = {
      name,
      addAliases: undefined,
      addOptions: undefined,
      addPositionedArgument: undefined,
      next: undefined,
      setCallback: undefined,
    };

    _commands[name] = <CommandHandler>{
      name,
      callback: undefined,
      aliases: [],
      options: [],
    };

    command.next = () => commands;

    command.addAliases = (...alias: string[]) => {
      _commands[name].aliases = [..._commands[name].aliases, ...alias];
      alias.forEach((alias) => {
        _commands[alias] = _commands[name];
      });
      return command;
    };

    command.addOptions = (...options: string[]) => {
      options.forEach((option) => {
        _commands[name].options.push(option);
      });
      return command;
    };

    command.setCallback = (callback: Callback) => {
      _commands[name].callback = callback;
      return command;
    };

    command.addPositionedArgument = (arg: string) => {
      orderedArgumentNames.push(arg);
      return command;
    };

    return command;
  };

  return commands;
};
