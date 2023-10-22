import { Command, Commands, CommandsCollection } from "./types";

export const buildHelpText = (
  commands: Commands,
  commandsCollection: CommandsCollection
): string => {
  let descriptions = buildDescriptionsText(commandsCollection);

  const helpText = `\n${
    (commands.headerText.length > 0 && commands.headerText) || ""
  }\n${descriptions}${
    (commands.footerText.length > 0 && commands.footerText) || ""
  }\n`;
  return helpText;
};

export const buildDescriptionsText = (
  commandsCollection: CommandsCollection
): string => {
  let descriptions = "";
  let max = 0;
  const ready: string[] = [];

  for (const com of Object.values(commandsCollection)) {
    const commandText = getCommandText(com);
    if (commandText.length > max) max = commandText.length;
  }
  for (const com of Object.values(commandsCollection)) {
    if (ready.includes(com.name)) continue;
    descriptions += com.getHelpLine(max + 4);
    ready.push(com.name);
  }

  return descriptions;
};

export const getCommandText = (command: Command): string => {
  const names = [command.name, ...command.aliases].join("|");

  const args = command.positionedArguments.map((a) => `[${a}]`).join(" ");

  const options = command.options
    .map((o, n) => `[${o}=${command.optionsExamples[n] || "VALUE"}]`)
    .join(" ");

  return `${names}   ${args}   ${options}`.trim() + "  ";
};
