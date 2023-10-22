import { Command, Commands, CommandsCollection } from "./types";

export const command: Command = {
  name: "command_1",
  aliases: ["al1", "al2"],
  callback: undefined,
  description: "command 1 description",
  getHelpLine: () => "help line...\n",
  options: ["op1", "op2"],
  optionsExamples: ["opEx1"],
  positionedArguments: ["pos1", "pos2"],
};
export const commands = <Commands>{
  headerText: "header text...",
  footerText: "footer text...",
};
export const commandsCollection: CommandsCollection = {
  command_1: command,
  al1: command,
  al2: command,
  command_2: {
    ...command,
    name: "command_2",
    description: "command 2 description",
    aliases: [],
  },
  help: {
    ...command,
    name: "help",
    callback: () => console["log"]("help text..."),
  },
};
