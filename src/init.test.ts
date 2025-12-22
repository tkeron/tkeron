import { describe, it, expect, afterEach, beforeEach, spyOn } from "bun:test";
import { init } from "./init";
import { rmSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("init", () => {
  const TEST_DIR = join(tmpdir(), `tkeron-init-test-${Date.now()}`);
  
  // Spy on console to suppress output during tests
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    
    // Suppress console output
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    
    // Restore console
    consoleLogSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
  });

  it("should create project directory with init_sample content", async () => {
    const projectName = "test-project";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, "src"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "index.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "index.ts"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "index.pre.ts"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "info-card.com.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "user-badge.com.ts"))).toBe(true);
  });

  it("should throw error if directory already exists", async () => {
    const projectName = "existing-project";
    const projectPath = join(TEST_DIR, projectName);
    mkdirSync(projectPath, { recursive: true });

    expect(async () => {
      await init({
        projectName: join(TEST_DIR, projectName),
      });
    }).toThrow();
  });

  it("should throw error if project name is not provided", async () => {
    expect(async () => {
      await init({
        projectName: "",
      });
    }).toThrow("Project name is required");
  });

  it("should copy all files from init_sample including new components", async () => {
    const projectName = "component-test";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    expect(existsSync(join(projectPath, "src", "hero-section.com.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "pre-render-card.com.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "html-components-card.com.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "ts-components-card.com.html"))).toBe(true);
    expect(existsSync(join(projectPath, "src", "counter-card.com.html"))).toBe(true);
  });

  it("should preserve file content when copying", async () => {
    const projectName = "content-test";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    const indexTs = readFileSync(join(projectPath, "src", "index.ts"), "utf-8");
    expect(indexTs).toContain("let count = 0");
    expect(indexTs).toContain("getElementById");

    const indexHtml = readFileSync(join(projectPath, "src", "index.html"), "utf-8");
    expect(indexHtml).toContain("<hero-section>");
    expect(indexHtml).toContain("<counter-card>");
  });

  it("should copy web directory if it exists", async () => {
    const projectName = "web-test";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    const webExists = existsSync(join(projectPath, "web"));
    if (webExists) {
      expect(existsSync(join(projectPath, "web", "index.html"))).toBe(true);
    }
  });

  it("should copy tkeron.d.ts as sibling to project directory", async () => {
    const projectName = "types-test";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    // tkeron.d.ts should be at project root, sibling to src/
    expect(existsSync(join(projectPath, "tkeron.d.ts"))).toBe(true);
    
    const dtsContent = readFileSync(join(projectPath, "tkeron.d.ts"), "utf-8");
    expect(dtsContent).toContain("declare module");
    expect(dtsContent).toContain("*.pre.ts");
    expect(dtsContent).toContain("*.com.ts");
  });

  it("should preserve tkeron.d.ts content correctly", async () => {
    const projectName = "types-content-test";
    const projectPath = join(TEST_DIR, projectName);

    await init({
      projectName: join(TEST_DIR, projectName),
    });

    const dtsContent = readFileSync(join(projectPath, "tkeron.d.ts"), "utf-8");
    expect(dtsContent).toContain("const document: Document");
    expect(dtsContent).toContain("const com: HTMLElement");
  });

  it("should initialize in current directory when '.' is provided", async () => {
    const emptyDir = join(TEST_DIR, "empty-current-dir");
    mkdirSync(emptyDir, { recursive: true });

    // Change to the empty directory and init with '.'
    const originalCwd = process.cwd();
    process.chdir(emptyDir);

    try {
      await init({ projectName: "." });

      expect(existsSync(join(emptyDir, "src"))).toBe(true);
      expect(existsSync(join(emptyDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(emptyDir, "tkeron.d.ts"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  // NOTE: Interactive prompt test (user answering 'y' or 'n') is not included
  // because mocking stdin in Bun is unreliable and can cause test flakiness.
  // The interactive behavior should be tested manually or with integration tests.
  // The force=true option is tested below as a non-interactive alternative.

  it("should overwrite files when force option is provided", async () => {
    const forceDir = join(TEST_DIR, "force-dir");
    mkdirSync(forceDir, { recursive: true });
    
    // Create existing tkeron files
    mkdirSync(join(forceDir, "src"), { recursive: true });
    require("fs").writeFileSync(join(forceDir, "src", "old.txt"), "old content");
    require("fs").writeFileSync(join(forceDir, "tkeron.d.ts"), "old types");

    const originalCwd = process.cwd();
    process.chdir(forceDir);

    try {
      await init({ projectName: ".", force: true });

      // Should have new tkeron structure
      expect(existsSync(join(forceDir, "src"))).toBe(true);
      expect(existsSync(join(forceDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(forceDir, "tkeron.d.ts"))).toBe(true);
      
      // Old file should be gone
      expect(existsSync(join(forceDir, "src", "old.txt"))).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should preserve non-tkeron files when overwriting", async () => {
    const preserveDir = join(TEST_DIR, "preserve-files-dir");
    mkdirSync(preserveDir, { recursive: true });
    
    // Create tkeron file and non-tkeron files
    mkdirSync(join(preserveDir, "src"), { recursive: true });
    require("fs").writeFileSync(join(preserveDir, "README.md"), "my readme");
    require("fs").writeFileSync(join(preserveDir, "package.json"), "{}");

    const originalCwd = process.cwd();
    process.chdir(preserveDir);

    try {
      await init({ projectName: ".", force: true });

      // Non-tkeron files should still exist
      expect(existsSync(join(preserveDir, "README.md"))).toBe(true);
      expect(existsSync(join(preserveDir, "package.json"))).toBe(true);
      
      // Tkeron files should be new
      expect(existsSync(join(preserveDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(preserveDir, "tkeron.d.ts"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should allow initializing in directory with only ignored files", async () => {
    const dirWithGit = join(TEST_DIR, "dir-with-git");
    mkdirSync(dirWithGit, { recursive: true });
    mkdirSync(join(dirWithGit, ".git"), { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(dirWithGit);

    try {
      await init({ projectName: "." });

      expect(existsSync(join(dirWithGit, "src"))).toBe(true);
      expect(existsSync(join(dirWithGit, "tkeron.d.ts"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should handle partial tkeron files - only src exists", async () => {
    const partialDir = join(TEST_DIR, "partial-src-dir");
    mkdirSync(partialDir, { recursive: true });
    mkdirSync(join(partialDir, "src"), { recursive: true });
    require("fs").writeFileSync(join(partialDir, "src", "old.js"), "old");

    const originalCwd = process.cwd();
    process.chdir(partialDir);

    try {
      await init({ projectName: ".", force: true });

      // Should have new complete structure
      expect(existsSync(join(partialDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(partialDir, "tkeron.d.ts"))).toBe(true);
      expect(existsSync(join(partialDir, "web"))).toBe(true);
      expect(existsSync(join(partialDir, "src", "old.js"))).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should handle partial tkeron files - only tkeron.d.ts exists", async () => {
    const partialDir = join(TEST_DIR, "partial-dts-dir");
    mkdirSync(partialDir, { recursive: true });
    require("fs").writeFileSync(join(partialDir, "tkeron.d.ts"), "old types");
    require("fs").writeFileSync(join(partialDir, "README.md"), "readme");

    const originalCwd = process.cwd();
    process.chdir(partialDir);

    try {
      await init({ projectName: ".", force: true });

      // Should have new structure
      expect(existsSync(join(partialDir, "src"))).toBe(true);
      expect(existsSync(join(partialDir, "web"))).toBe(true);
      expect(existsSync(join(partialDir, "tkeron.d.ts"))).toBe(true);
      
      // README should be preserved
      expect(existsSync(join(partialDir, "README.md"))).toBe(true);
      const readme = readFileSync(join(partialDir, "README.md"), "utf-8");
      expect(readme).toBe("readme");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should handle directory with .git and tkeron files together", async () => {
    const mixedDir = join(TEST_DIR, "git-and-tkeron-dir");
    mkdirSync(mixedDir, { recursive: true });
    mkdirSync(join(mixedDir, ".git"), { recursive: true });
    mkdirSync(join(mixedDir, "src"), { recursive: true });
    require("fs").writeFileSync(join(mixedDir, "src", "old.txt"), "old");

    const originalCwd = process.cwd();
    process.chdir(mixedDir);

    try {
      await init({ projectName: ".", force: true });

      // Should have new tkeron structure
      expect(existsSync(join(mixedDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(mixedDir, "tkeron.d.ts"))).toBe(true);
      
      // .git should be preserved
      expect(existsSync(join(mixedDir, ".git"))).toBe(true);
      
      // Old src file should be gone
      expect(existsSync(join(mixedDir, "src", "old.txt"))).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should handle multiple non-tkeron files with tkeron files", async () => {
    const multipleDir = join(TEST_DIR, "multiple-files-dir");
    mkdirSync(multipleDir, { recursive: true });
    mkdirSync(join(multipleDir, "src"), { recursive: true });
    require("fs").writeFileSync(join(multipleDir, "package.json"), "{}");
    require("fs").writeFileSync(join(multipleDir, ".gitignore"), "node_modules");
    require("fs").writeFileSync(join(multipleDir, "README.md"), "readme");
    mkdirSync(join(multipleDir, "docs"), { recursive: true });
    require("fs").writeFileSync(join(multipleDir, "docs", "guide.md"), "guide");

    const originalCwd = process.cwd();
    process.chdir(multipleDir);

    try {
      await init({ projectName: ".", force: true });

      // Tkeron files should be new
      expect(existsSync(join(multipleDir, "src", "index.html"))).toBe(true);
      expect(existsSync(join(multipleDir, "tkeron.d.ts"))).toBe(true);
      
      // All non-tkeron files should be preserved
      expect(existsSync(join(multipleDir, "package.json"))).toBe(true);
      expect(existsSync(join(multipleDir, ".gitignore"))).toBe(true);
      expect(existsSync(join(multipleDir, "README.md"))).toBe(true);
      expect(existsSync(join(multipleDir, "docs"))).toBe(true);
      expect(existsSync(join(multipleDir, "docs", "guide.md"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
