import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { skills } from "../src/skills";
import { skillsWrapper } from "../src/skillsWrapper";
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  getTestResources,
  silentLogger,
  createTestLogger,
} from "./test-helpers";

describe("skills", () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    const resources = getTestResources("skills");
    testDir = resources.dir;
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("creates the target directory and copies all skills", async () => {
    await skills({ logger: silentLogger, target: "skills" });

    const targetDir = join(testDir, "skills");
    expect(existsSync(targetDir)).toBe(true);
    expect(existsSync(join(targetDir, "tkeron", "SKILL.md"))).toBe(true);
    expect(existsSync(join(targetDir, "tkeron-patterns", "SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(join(targetDir, "tkeron-components", "SKILL.md"))).toBe(
      true,
    );
  });

  it("copied SKILL.md files have valid frontmatter and content", async () => {
    await skills({ logger: silentLogger, target: "skills" });

    const core = readFileSync(
      join(testDir, "skills", "tkeron", "SKILL.md"),
      "utf-8",
    );
    expect(core.startsWith("---")).toBe(true);
    expect(core).toContain("name: tkeron");
    expect(core).toContain("description:");

    const bp = readFileSync(
      join(testDir, "skills", "tkeron-patterns", "SKILL.md"),
      "utf-8",
    );
    expect(bp.startsWith("---")).toBe(true);
    expect(bp).toContain("name: tkeron-patterns");

    const components = readFileSync(
      join(testDir, "skills", "tkeron-components", "SKILL.md"),
      "utf-8",
    );
    expect(components.startsWith("---")).toBe(true);
    expect(components).toContain("name: tkeron-components");
    expect(components).toContain(".post.ts");
  });

  it("accepts a custom target directory", async () => {
    await skills({ logger: silentLogger, target: "my-agent-skills" });

    const targetDir = join(testDir, "my-agent-skills");
    expect(existsSync(join(targetDir, "tkeron", "SKILL.md"))).toBe(true);
    expect(existsSync(join(targetDir, "tkeron-patterns", "SKILL.md"))).toBe(
      true,
    );
  });

  it("refuses to overwrite existing skill files without force", async () => {
    const targetDir = join(testDir, "skills", "tkeron");
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, "SKILL.md"), "user content");

    await expect(
      skills({ logger: silentLogger, target: "skills" }),
    ).rejects.toThrow(/already exist/i);

    const content = readFileSync(join(targetDir, "SKILL.md"), "utf-8");
    expect(content).toBe("user content");
  });

  it("overwrites existing skill files when force is true", async () => {
    const targetDir = join(testDir, "skills", "tkeron");
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, "SKILL.md"), "user content");

    await skills({ logger: silentLogger, force: true, target: "skills" });

    const content = readFileSync(join(targetDir, "SKILL.md"), "utf-8");
    expect(content).not.toBe("user content");
    expect(content).toContain("name: tkeron");
  });

  it("logs the list of installed skills", async () => {
    const testLogger = createTestLogger();
    await skills({ logger: testLogger.logger, target: "skills" });

    const output = testLogger.logs.join("\n");
    expect(output).toContain("tkeron");
    expect(output).toContain("tkeron-patterns");
    expect(output).toContain("tkeron-components");
  });
  it("throws NO_ENVIRONMENTS_DETECTED when no target and no env detected", async () => {
    await expect(skills({ logger: silentLogger })).rejects.toThrow(
      "NO_ENVIRONMENTS_DETECTED",
    );
  });

  it("auto-detects .github/ and installs to .github/skills/", async () => {
    mkdirSync(join(testDir, ".github"), { recursive: true });
    await skills({ logger: silentLogger });
    expect(
      existsSync(join(testDir, ".github", "skills", "tkeron", "SKILL.md")),
    ).toBe(true);
    expect(
      existsSync(
        join(testDir, ".github", "skills", "tkeron-patterns", "SKILL.md"),
      ),
    ).toBe(true);
  });

  it("auto-detects .cursor/ and installs to .cursor/rules/ with alwaysApply: false", async () => {
    mkdirSync(join(testDir, ".cursor"), { recursive: true });
    await skills({ logger: silentLogger });
    const skill = readFileSync(
      join(testDir, ".cursor", "rules", "tkeron", "SKILL.md"),
      "utf-8",
    );
    expect(skill).toContain("alwaysApply: false");
    expect(skill).toContain("name: tkeron");
  });

  it("auto-detects .claude/ and installs to .claude/rules/", async () => {
    mkdirSync(join(testDir, ".claude"), { recursive: true });
    await skills({ logger: silentLogger });
    expect(
      existsSync(join(testDir, ".claude", "rules", "tkeron", "SKILL.md")),
    ).toBe(true);
  });

  it("auto-detects CLAUDE.md and installs to .claude/rules/", async () => {
    writeFileSync(join(testDir, "CLAUDE.md"), "# Instructions");
    await skills({ logger: silentLogger });
    expect(
      existsSync(join(testDir, ".claude", "rules", "tkeron", "SKILL.md")),
    ).toBe(true);
  });

  it("installs to multiple targets when multiple envs detected", async () => {
    mkdirSync(join(testDir, ".cursor"), { recursive: true });
    mkdirSync(join(testDir, ".github"), { recursive: true });
    await skills({ logger: silentLogger });
    expect(
      existsSync(join(testDir, ".cursor", "rules", "tkeron", "SKILL.md")),
    ).toBe(true);
    expect(
      existsSync(join(testDir, ".github", "skills", "tkeron", "SKILL.md")),
    ).toBe(true);
  });

  it("cursor skills do not have alwaysApply when installed with explicit target", async () => {
    mkdirSync(join(testDir, ".cursor"), { recursive: true });
    await skills({ logger: silentLogger, target: "custom-skills" });
    const skill = readFileSync(
      join(testDir, "custom-skills", "tkeron-components", "SKILL.md"),
      "utf-8",
    );
    expect(skill).not.toContain("alwaysApply:");
  });

  it("dry-run with explicit target: logs preview, creates no files", async () => {
    const testLogger = createTestLogger();
    await skills({ logger: testLogger.logger, target: "skills", dryRun: true });

    const output = testLogger.logs.join("\n");
    expect(output).toContain("Would install");
    expect(output).toContain("tkeron");
    expect(existsSync(join(testDir, "skills"))).toBe(false);
  });

  it("dry-run with auto-detected env: logs preview, creates no files", async () => {
    mkdirSync(join(testDir, ".github"), { recursive: true });
    const testLogger = createTestLogger();
    await skills({ logger: testLogger.logger, dryRun: true });

    const output = testLogger.logs.join("\n");
    expect(output).toContain("Would install");
    expect(existsSync(join(testDir, ".github", "skills"))).toBe(false);
  });

  it("dry-run does not throw when skill files already exist", async () => {
    const targetDir = join(testDir, "skills", "tkeron");
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, "SKILL.md"), "user content");

    await expect(
      skills({ logger: silentLogger, target: "skills", dryRun: true }),
    ).resolves.toBeUndefined();

    const content = readFileSync(join(targetDir, "SKILL.md"), "utf-8");
    expect(content).toBe("user content");
  });

  it("dry-run logs all skill names", async () => {
    const testLogger = createTestLogger();
    await skills({ logger: testLogger.logger, target: "skills", dryRun: true });

    const output = testLogger.logs.join("\n");
    expect(output).toContain("tkeron");
    expect(output).toContain("tkeron-components");
    expect(output).toContain("tkeron-testing");
  });

  it("dry-run throws NO_ENVIRONMENTS_DETECTED when no target and no env", async () => {
    await expect(
      skills({ logger: silentLogger, dryRun: true }),
    ).rejects.toThrow("NO_ENVIRONMENTS_DETECTED");
  });
});

describe("skillsWrapper", () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    const resources = getTestResources("skillsWrapper");
    testDir = resources.dir;
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("runs successfully with explicit target", async () => {
    await skillsWrapper({ logger: silentLogger, target: "skills" });
    expect(existsSync(join(testDir, "skills", "tkeron", "SKILL.md"))).toBe(
      true,
    );
  });

  it("prompts and creates skills/ when no env detected and user confirms", async () => {
    const confirm = async (_message: string) => true;
    await skillsWrapper({ logger: silentLogger, confirm });
    expect(existsSync(join(testDir, "skills", "tkeron", "SKILL.md"))).toBe(
      true,
    );
  });

  it("aborts without creating files when user declines prompt", async () => {
    const confirm = async (_message: string) => false;
    await skillsWrapper({ logger: silentLogger, confirm });
    expect(existsSync(join(testDir, "skills"))).toBe(false);
  });

  it("dry-run creates no files with explicit target", async () => {
    const testLogger = createTestLogger();
    await skillsWrapper({
      logger: testLogger.logger,
      target: "skills",
      dryRun: true,
    });
    expect(existsSync(join(testDir, "skills"))).toBe(false);
    expect(testLogger.logs.join("\n")).toContain("Would install");
  });

  it("dry-run with no env detected does not prompt and creates no files", async () => {
    const confirmCalled = { value: false };
    const confirm = async (_message: string) => {
      confirmCalled.value = true;
      return true;
    };
    const testLogger = createTestLogger();
    await skillsWrapper({ logger: testLogger.logger, dryRun: true, confirm });
    expect(confirmCalled.value).toBe(false);
    expect(existsSync(join(testDir, "skills"))).toBe(false);
  });
});
