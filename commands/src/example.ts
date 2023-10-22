import { getCommands } from ".";

const commands = getCommands("test program", "0.0.14")
  .addCommand("com1")
  .addAlias("c1")
  .addOption("opt1")
  .addOption("opt2")
  .addDescription("command 001 test...")
  .addPositionedArgument("pos0")
  .addPositionedArgument("pos1")
  .setCallback(console.log)

  .commands()

  .addCommand("com2")
  .addAlias("c2")
  .addAlias("a2")
  .addOption("opt1")
  .addDescription("command 002 test...")
  .setCallback(console.log)

  .commands()

  .addCommand("com3")
  .addAlias("c3")
  .addOption("opt1")
  .addOption("opt2", "exOpt2...")
  .addOption("opt3")
  .addDescription("command 003 test...")
  .addPositionedArgument("pos0")
  .addPositionedArgument("pos1")
  .addPositionedArgument("pos3")
  .setCallback(console.log)

  .commands()

  .addHeaderText("header...\n\n")
  .addFooterText("\n\nFooter...");

commands.start([
  "",
  "",
  ..."com1 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

commands.start([
  "",
  "",
  ..."a2 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

commands.start([
  "",
  "",
  ..."c3 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

globalThis.commands = commands;
