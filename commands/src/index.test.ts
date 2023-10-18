import { getCommands } from ".";

describe("main test", () => {
  it("should run callback when a command match - happy path", () => {
    process.argv = ["", "", "test", "qwerty"];

    const callback = jest.fn();

    getCommands().addCommand("qwerty").setCallback(callback).next().run();

    expect(callback).toHaveBeenCalled();
  });
  it("should run callback when a command alias match - happy path", () => {
    process.argv = ["", "", "test", "-q"];

    const callback = jest.fn();

    getCommands()
      .addCommand("qwerty")
      .addAliases("-q")
      .setCallback(callback)
      .next()
      .run();

    expect(callback).toHaveBeenCalled();
  });
  it("should run callback with options when a command match", () => {
    process.argv = ["", "", "test", "-q", "op1:op1value", "op2=op2value"];

    const callback = jest.fn();

    getCommands()
      .addCommand("qwerty")
      .addAliases("-q")
      .addOptions("op1", "op2")
      .setCallback(callback)
      .next()
      .run();

    expect(callback).toHaveBeenCalledWith({ op1: "op1value", op2: "op2value" });
  });
  it("should run callback with ordered arguments without command", () => {
    process.argv = [
      "",
      "",
      "-q",
      "ord0",
      "op1:op1value",
      "ord1",
      "op2=op2value",
    ];

    const callback = jest.fn();

    getCommands()
      .addCommand("qwerty")
      .addAliases("-q")
      .addOptions("op1", "op2")
      .setCallback(callback)
      .next()
      .run();

    expect(callback).toHaveBeenCalledWith({ op1: "op1value", op2: "op2value" });
  });

  it("should run callback with ordered arguments only", () => {
    process.argv = [
      "",
      "",
      "qwerty",
      "ord0",
      "op1:op1value",
      "ord1",
      "op2=op2value",
    ];

    const callback = jest.fn();

    getCommands()
      .addCommand("qwerty")
      .addOptions("op1", "op2")
      .addPositionedArgument("pos0")
      .addPositionedArgument("pos1")
      .setCallback(callback)
      .next()
      .run();

    expect(callback).toHaveBeenCalledWith({
      op1: "op1value",
      op2: "op2value",
      pos0: "ord0",
      pos1: "ord1",
    });
  });
});
