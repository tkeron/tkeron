import { command, commands, commandsCollection } from "./testConstants";
import {
  buildDescriptionsText,
  buildHelpText,
  getCommandText,
} from "./textFuncs";

describe("text Functions", () => {
  describe("getCommandText", () => {
    it("should return command text", () => {
      const result = getCommandText(command);

      expect(result).toBe(
        "command_1|al1|al2   [pos1] [pos2]   [op1=opEx1] [op2=VALUE]  "
      );
    });

    it("should return command text without aliases", () => {
      const result = getCommandText({ ...command, aliases: [] });

      expect(result).toBe(
        "command_1   [pos1] [pos2]   [op1=opEx1] [op2=VALUE]  "
      );
    });
  });
  describe("buildHelpText", () => {
    it("should return help text", () => {
      const result = buildHelpText(commands, commandsCollection);
      expect(result).toBe(
        "\nheader text...\nhelp line...\nhelp line...\nhelp line...\nfooter text...\n"
      );
    });
    it("should return help text without headerText", () => {
      const result = buildHelpText(
        { ...commands, headerText: "" },
        commandsCollection
      );
      expect(result).toBe("\n\nhelp line...\nhelp line...\nhelp line...\nfooter text...\n");
    });
    it("should return help text without footerText", () => {
      const result = buildHelpText(
        { ...commands, footerText: "" },
        commandsCollection
      );
      expect(result).toBe("\nheader text...\nhelp line...\nhelp line...\nhelp line...\n\n");
    });
  });
  describe("buildDescriptionsText", () => {
    it("should return description text", () => {
      const result = buildDescriptionsText(commandsCollection);
      expect(result).toBe("help line...\n".repeat(3));
    });
  });
});
