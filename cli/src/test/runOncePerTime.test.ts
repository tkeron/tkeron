import { runOncePerTime } from "../runOncePerTime";

describe("runOncePerTime", () => {
  it("run once in 20ms", (done) => {
    const runOnce20ms = runOncePerTime(20);
    const result: number[] = [];
    const add = (n: number) => result.push(n);
    setTimeout(() => {
      expect(result).toHaveLength(1);
      done();
    }, 20);
    setTimeout(() => runOnce20ms(() => add(1)), 5);
    setTimeout(() => runOnce20ms(() => add(1)), 4);
    setTimeout(() => runOnce20ms(() => add(1)), 3);
  });
});
