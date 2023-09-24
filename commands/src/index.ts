export interface CommandHandler {
  name: string;
  aliases: string[];
  options: string[];
  callback: CallableFunction;
}

export interface Command {
  name: string;
  next: () => Commands;
  addAliases: (...alias: string[]) => Command;
  addOptions: (...options: string[]) => Command;
  setCallback: (callback: CallableFunction) => Command;
}

export interface Commands {
  addCommand: (commandName: string) => Command;
  run: () => void;
}

const _commands: { [key: string]: CommandHandler } = {};

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
  for (const commandIndex of currentCommands) {
    const command = _commands[commandIndex];
    if (!command) continue;
    const options =
      parsedOptions && command.options
        ? command.options.reduce((p, c) => {
            p[c] = parsedOptions[c];
            return p;
          }, {})
        : {};
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

    command.setCallback = (callback: CallableFunction) => {
      _commands[name].callback = callback;
      return command;
    };

    return command;
  };

  return commands;
};
