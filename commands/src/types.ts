export interface Command {
  name: string;
  description: string;
  aliases: string[];
  options: string[];
  optionsExamples: string[];
  positionedArguments: string[];
  getHelpLine: (width?: number) => string;
  callback: Callback;
}

export type parsedOptions = { [key: string]: string };

export type Callback = (options?: parsedOptions) => void;

export type CommandsCollection = { [key: string]: Command };

export type OrderedArgumentNames = { [key: string]: string[] };

export interface CommandFactory {
  name: string;
  commands: () => Commands;
  addAlias: (alias: string) => CommandFactory;
  addDescription: (description: string) => CommandFactory;
  addOption: (option: string, example?: string) => CommandFactory;
  addPositionedArgument: (arg: string) => CommandFactory;
  setCallback: (callback: Callback) => CommandFactory;
}

export interface Commands {
  addCommand: (commandName: string) => CommandFactory;
  programName: string;
  headerText: string;
  footerText: string;
  version: string;
  addHeaderText: (text: string) => Commands;
  addFooterText: (text: string) => Commands;
  start: (argv?: string[]) => void;
}
