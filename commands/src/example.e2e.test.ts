describe("example e2e", () => {
  const { log } = globalThis.console;
  let logs: any[] = [];
  jest.spyOn(globalThis.console, "log").mockImplementation((...args: any) => {
    logs.push(args);
    // log(...args);
  });

  it("should runs ok", (done) => {
    expect(logs).toHaveLength(0);
    //@ts-ignore
    import("./example");
    const check = () => {
      // @ts-ignore
      const { commands } = globalThis;
      if (!commands) return;
      expect(logs).toHaveLength(3);
      expect(logs).toStrictEqual([
        ["argument 'asdasd' not defined"],
        ["arguments 'pos0value, pos1value, asdasd' not defined"],
        [
          {
            opt1: "qw111erty",
            opt2: "as222d",
            pos0: "pos0value",
            pos1: "pos1value",
            pos3: "asdasd",
          },
        ],
      ]);
      clearInterval(handler);
      done();
    };
    const handler = setInterval(check, 10);
  });
});
