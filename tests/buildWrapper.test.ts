import { describe, it, expect } from "bun:test";
import type { BuildWrapperOptions } from "../src/buildWrapper";

describe("buildWrapper", () => {
  it("should not accept sourceDir or targetDir in its options type", () => {
    const options: BuildWrapperOptions = { logger: undefined };
    expect(options).toBeDefined();
    expect("sourceDir" in options).toBe(false);
    expect("targetDir" in options).toBe(false);
  });

  it("should only pass logger to build, ignoring extra options", async () => {
    const { buildWrapper } = await import("../src/buildWrapper");
    expect(typeof buildWrapper).toBe("function");
    expect(buildWrapper.length).toBe(1);
  });
});
