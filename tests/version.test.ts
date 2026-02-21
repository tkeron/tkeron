import { describe, it, expect } from "bun:test";
import { join } from "path";
import packageJson from "../package.json";

const CLI_PATH = join(import.meta.dir, "../index.ts");

const runCli = (args: string[]) => {
  const result = Bun.spawnSync(["bun", CLI_PATH, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    exitCode: result.exitCode,
  };
};

describe("version command", () => {
  it("should output the correct version with -v", () => {
    const { stdout } = runCli(["-v"]);
    expect(stdout).toContain(packageJson.version);
  });

  it("should output the correct version with --version", () => {
    const { stdout } = runCli(["--version"]);
    expect(stdout).toContain(packageJson.version);
  });

  it("should output the correct version with version command", () => {
    const { stdout } = runCli(["version"]);
    expect(stdout).toContain(packageJson.version);
  });

  it("should NOT output the default fallback version 0.0.1", () => {
    const { stdout } = runCli(["-v"]);
    expect(stdout).not.toContain("0.0.1");
  });
});
