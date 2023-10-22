import { getStart } from "./getStart";
import { commandsCollection } from "./testConstants";

describe("getStart", () => {
  let callback: jest.Mock;
  let start: (argv?: string[]) => void;
  let logMock: jest.SpyInstance;
  let logs: any[] = [];

  beforeEach(() => {
    callback = jest.fn();
    commandsCollection.command_1.callback = callback;
    start = getStart(commandsCollection);
    logMock = jest.spyOn(console, "log").mockImplementation((...args: any) => {
      logs.push(args);
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("happy path, run command", () => {
    start(["", "", "command_1"]);
    expect(callback).toBeCalledTimes(1);
  });
  it("run command with option", () => {
    start(["", "", "command_1", "op1=value1"]);
    expect(callback).toBeCalledTimes(1);
  });
  it("run command with extra positioned arguments", () => {
    logs = [];
    start(["", "", "command_1", "pos1", "pos2", "pos3"]);
    start(["", "", "command_1", "pos1", "pos2", "pos3", "pos4"]);
    expect(logs).toHaveLength(2);
    expect(logs[0]).toHaveLength(1);
    expect(logs[0][0]).toBe("argument 'pos3' not defined");
    expect(logs[1]).toHaveLength(1);
    expect(logs[1][0]).toBe("arguments 'pos3, pos4' not defined");
  });
  it("run with process.argv", () => {
    process.argv = ["", ""];
    start();
    logs = [];
    commandsCollection.help.callback();
    expect(logs).toHaveLength(1);
  });
  it("should throw when no args passed", () => {
    process.argv = undefined;
    expect(start).toThrow(new Error("no arguments passed"));
  });
  it("should throw when less than 2 args passed", () => {
    process.argv = [];
    expect(start).toThrow(new Error("arguments out of range"));
  });
  it("should show message when passed an unexistent commnad", () => {
    process.argv = ["", "", "fakeCommand"];
    logs = [];
    start();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveLength(1);
    expect(logs[0][0]).toBe("command 'fakeCommand' not found");
  });
  it("run with less positioned arguments", () => {
    start(["", "", "al1", "arg001"]);
    expect(callback).toBeCalledWith({ pos1: "arg001" });
  });
});
