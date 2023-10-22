import { getStart } from "./getStart";
import { buildHelpText, getCommandText } from "./textFuncs";
import {
  CommandFactory,
  Command,
  Commands,
  CommandsCollection,
  Callback,
} from "./types";
export * from "./types";

export const getCommands = (
  programName: string = "program",
  version: string = "0.0.1"
): Commands => {
  const commandsCollection: CommandsCollection = {};

  const commands = initCommands(commandsCollection);
  commands.programName = programName;
  commands.version = version;

  initHelpAndVersion(commands, commandsCollection);

  return commands;
};

export const initCommands = (
  commandsCollection: CommandsCollection,
  commands: Commands = {
    programName: "",
    version: "",
    footerText: "",
    headerText: "",
    addCommand: undefined,
    start: undefined,
    addHeaderText: undefined,
    addFooterText: undefined,
  },
  commandFactory: CommandFactory = {
    commands: undefined,
    name: undefined,
    addAlias: undefined,
    addOption: undefined,
    addPositionedArgument: undefined,
    addDescription: undefined,
    setCallback: undefined,
  }
): Commands => {
  if (!commandFactory.commands) commandFactory.commands = () => commands;
  commands.addCommand = getAddCommand(commandsCollection, commandFactory);
  commands.start = getStart(commandsCollection);
  commands.addHeaderText = getAddHeaderText(commands);
  commands.addFooterText = getAddFooterText(commands);

  return commands;
};

export const initHelpAndVersion = (
  commands: Commands,
  commandsCollection: CommandsCollection
) => {
  const helpCallback = () =>
    console["log"](buildHelpText(commands, commandsCollection));
  const versionCallback = () =>
    console["log"](
      `${commands.headerText || ""}\n${commands.version}\n${
        commands.footerText || ""
      }\n`
    );

  commands
    .addCommand("help")
    .addAlias("-h")
    .addAlias("--help")
    .addDescription("show program help")
    .setCallback(helpCallback);
  commands
    .addCommand("version")
    .addAlias("-v")
    .addAlias("--version")
    .addDescription("show program version")
    .setCallback(versionCallback);

  return { helpCallback, versionCallback };
};

export const getAddCommand =
  (commandsCollection: CommandsCollection, commandFactory: CommandFactory) =>
  (commandName: string) => {
    commandFactory.name = commandName;
    const command: Command = {
      aliases: [],
      callback: undefined,
      description: "",
      name: commandName,
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      getHelpLine: undefined,
    };
    commandsCollection[commandName] = command;
    command.getHelpLine = getGetHelpLine(command);

    commandFactory.addAlias = getAddAlias(commandFactory, commandsCollection);
    commandFactory.addOption = getAddOption(commandFactory, commandsCollection);
    commandFactory.addDescription = getAddDescription(
      commandFactory,
      commandsCollection
    );
    commandFactory.setCallback = getSetCallback(
      commandFactory,
      commandsCollection
    );
    commandFactory.addPositionedArgument = getAddPositionedArgument(
      commandFactory,
      commandsCollection
    );

    return commandFactory;
  };

export const getAddAlias = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection
) => {
  return (alias: string) => {
    commandsCollection[commandFactory.name].aliases.push(alias);
    commandsCollection[alias] = commandsCollection[commandFactory.name];

    return commandFactory;
  };
};

export const getAddOption =
  (commandFactory: CommandFactory, commandsCollection: CommandsCollection) =>
  (option: string, example?: string) => {
    commandsCollection[commandFactory.name].options.push(option);
    commandsCollection[commandFactory.name].optionsExamples.push(example || "");

    return commandFactory;
  };

export const getAddPositionedArgument = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection
) => {
  return (arg: string): CommandFactory => {
    const positionedArguments =
      commandsCollection[commandFactory.name].positionedArguments;

    if (!positionedArguments.includes(commandFactory.name)) {
      positionedArguments.push(arg);
    }

    return commandFactory;
  };
};

export const getSetCallback = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection
) => {
  return (fn: Callback): CommandFactory => {
    commandsCollection[commandFactory.name].callback = fn;

    return commandFactory;
  };
};

export const getAddDescription = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection
) => {
  return (description: string) => {
    commandsCollection[commandFactory.name].description = description;
    return commandFactory;
  };
};

export const getAddHeaderText = (commands: Commands) => {
  return (text: string) => {
    commands.headerText = text;
    return commands;
  };
};

export const getAddFooterText = (commands: Commands) => {
  return (text: string) => {
    commands.footerText = text;
    return commands;
  };
};

export const getGetHelpLine =
  (command: Command) =>
  (width: number = 50) => {
    let helpLine =
      getCommandText(command).padEnd(width, ".") +
      "  " +
      command.description +
      "\n";

    return helpLine;
  };
