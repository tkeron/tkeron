import { describe, it, expect, spyOn } from "bun:test";
import { init } from "../src/init";
import { promptUser } from "../src/promptUser";
import { rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  getTestResources,
  silentLogger,
  createTestLogger,
} from "./test-helpers";

describe("promptUser", () => {
  it("should return true when user inputs 'y'", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("y");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(true);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return true when user inputs 'yes'", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("yes");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(true);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return true when user inputs 'Y' (uppercase)", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("Y");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(true);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return true when user inputs 'YES' (uppercase)", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("YES");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(true);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return false when user inputs 'n'", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("n");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(false);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return false when user inputs 'no'", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("no");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(false);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return false when user inputs empty string", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(false);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should return false when user inputs random text", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("random");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(false);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });

  it("should trim whitespace from user input", async () => {
    const mockReadline = {
      createInterface: () => ({
        question: (q: string, callback: (answer: string) => void) => {
          callback("  y  ");
        },
        close: () => {},
      }),
    };

    const readlineModule = await import("readline");
    const createInterfaceSpy = spyOn(
      readlineModule,
      "createInterface",
    ).mockImplementation(mockReadline.createInterface as any);

    try {
      const result = await promptUser("Test question? ");
      expect(result).toBe(true);
    } finally {
      createInterfaceSpy?.mockRestore();
    }
  });
});

describe("init", () => {
  it("should create project directory with init_sample content", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-create-project-directory-with-init-sample-content",
    );

    try {
      const projectName = "test-project";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(projectPath)).toBe(true);
      expect(existsSync(join(projectPath, "websrc"))).toBe(true);
      expect(existsSync(join(projectPath, "websrc", "index.html"))).toBe(true);
      expect(existsSync(join(projectPath, "websrc", "index.ts"))).toBe(true);
      expect(existsSync(join(projectPath, "websrc", "index.pre.ts"))).toBe(
        true,
      );
      expect(
        existsSync(join(projectPath, "websrc", "info-card.com.html")),
      ).toBe(true);
      expect(existsSync(join(projectPath, "websrc", "user-badge.com.ts"))).toBe(
        true,
      );
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should throw error if non-empty directory already exists", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-throw-error-if-directory-already-exists",
    );

    try {
      const projectName = "existing-project";
      const projectPath = join(TEST_DIR, projectName);
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, "something.txt"), "content");

      expect(async () => {
        await init({
          projectName: join(TEST_DIR, projectName),
          logger: silentLogger,
        });
      }).toThrow();
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should throw error if project name is not provided", async () => {
    expect(async () => {
      await init({
        projectName: "",
        logger: silentLogger,
      });
    }).toThrow("Project name is required");
  });

  it("should copy all files from init_sample including new components", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-copy-all-files-from-init-sample-including-new-components",
    );

    try {
      const projectName = "component-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(
        existsSync(join(projectPath, "websrc", "hero-section.com.html")),
      ).toBe(true);
      expect(
        existsSync(join(projectPath, "websrc", "pre-render-card.com.html")),
      ).toBe(true);
      expect(
        existsSync(
          join(projectPath, "websrc", "html-components-card.com.html"),
        ),
      ).toBe(true);
      expect(
        existsSync(join(projectPath, "websrc", "ts-components-card.com.html")),
      ).toBe(true);
      expect(
        existsSync(join(projectPath, "websrc", "counter-card.com.html")),
      ).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should preserve file content when copying", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-preserve-file-content-when-copying",
    );

    try {
      const projectName = "content-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      const indexTs = readFileSync(
        join(projectPath, "websrc", "index.ts"),
        "utf-8",
      );
      expect(indexTs).toContain("let clickCount = 0");
      expect(indexTs).toContain("getElementById");

      const indexHtml = readFileSync(
        join(projectPath, "websrc", "index.html"),
        "utf-8",
      );
      expect(indexHtml).toContain("<hero-section>");
      expect(indexHtml).toContain("<counter-card>");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should copy api-service.ts for pre-rendering with external APIs", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-copy-api-service-ts-for-pre-rendering-with-external-apis",
    );

    try {
      const projectName = "api-service-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(join(projectPath, "websrc", "api-service.ts"))).toBe(
        true,
      );

      const apiServiceContent = readFileSync(
        join(projectPath, "websrc", "api-service.ts"),
        "utf-8",
      );
      expect(apiServiceContent).toContain("getRandomQuote");
      expect(apiServiceContent).toContain("getBuildMetadata");
      expect(apiServiceContent).toContain(
        "https://dummyjson.com/quotes/random",
      );

      const indexPreTs = readFileSync(
        join(projectPath, "websrc", "index.pre.ts"),
        "utf-8",
      );
      expect(indexPreTs).toContain("import");
      expect(indexPreTs).toContain("./api-service");
      expect(indexPreTs).toContain("getRandomQuote");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should not copy web directory (it's generated by build)", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-not-copy-web-directory-it-s-generated-by-build",
    );

    try {
      const projectName = "web-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(join(projectPath, "web"))).toBe(false);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should copy tkeron.d.ts as sibling to project directory", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-copy-tkeron-d-ts-as-sibling-to-project-directory",
    );

    try {
      const projectName = "types-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(join(projectPath, "tkeron.d.ts"))).toBe(true);

      const dtsContent = readFileSync(
        join(projectPath, "tkeron.d.ts"),
        "utf-8",
      );
      expect(dtsContent).toContain("declare const com");
      expect(dtsContent).toContain("HTMLElement");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should preserve tkeron.d.ts content correctly", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-preserve-tkeron-d-ts-content-correctly",
    );

    try {
      const projectName = "types-content-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      const dtsContent = readFileSync(
        join(projectPath, "tkeron.d.ts"),
        "utf-8",
      );
      expect(dtsContent).toContain("declare const com: HTMLElement");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should initialize in current directory when '.' is provided", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-initialize-in-current-directory-when-is-provided",
    );

    try {
      const emptyDir = join(TEST_DIR, "empty-current-dir");
      mkdirSync(emptyDir, { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(emptyDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        expect(existsSync(join(emptyDir, "websrc"))).toBe(true);
        expect(existsSync(join(emptyDir, "websrc", "index.html"))).toBe(true);
        expect(existsSync(join(emptyDir, "tkeron.d.ts"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should overwrite files when force option is provided", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-overwrite-files-when-force-option-is-provided",
    );

    try {
      const forceDir = join(TEST_DIR, "force-dir");
      mkdirSync(forceDir, { recursive: true });

      mkdirSync(join(forceDir, "websrc"), { recursive: true });
      writeFileSync(join(forceDir, "websrc", "old.txt"), "old content");
      writeFileSync(join(forceDir, "tkeron.d.ts"), "old types");

      const originalCwd = process.cwd();
      process.chdir(forceDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(forceDir, "websrc"))).toBe(true);
        expect(existsSync(join(forceDir, "websrc", "index.html"))).toBe(true);
        expect(existsSync(join(forceDir, "tkeron.d.ts"))).toBe(true);

        expect(existsSync(join(forceDir, "websrc", "old.txt"))).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should overwrite existing directory when force option is provided for non-current directory", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-overwrite-existing-directory-when-force-option-is-provided",
    );

    try {
      const projectName = "example";
      const projectPath = join(TEST_DIR, projectName);
      mkdirSync(projectPath, { recursive: true });
      writeFileSync(join(projectPath, "old-file.txt"), "old content");

      await init({
        projectName: join(TEST_DIR, projectName),
        force: true,
        logger: silentLogger,
      });

      expect(existsSync(join(projectPath, "websrc"))).toBe(true);
      expect(existsSync(join(projectPath, "websrc", "index.html"))).toBe(true);
      expect(existsSync(join(projectPath, "tkeron.d.ts"))).toBe(true);

      expect(existsSync(join(projectPath, "old-file.txt"))).toBe(false);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should preserve non-tkeron files when overwriting", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-preserve-non-tkeron-files-when-overwriting",
    );

    try {
      const preserveDir = join(TEST_DIR, "preserve-files-dir");
      mkdirSync(preserveDir, { recursive: true });

      mkdirSync(join(preserveDir, "websrc"), { recursive: true });
      writeFileSync(join(preserveDir, "README.md"), "my readme");
      writeFileSync(join(preserveDir, "package.json"), "{}");

      const originalCwd = process.cwd();
      process.chdir(preserveDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(preserveDir, "README.md"))).toBe(true);
        expect(existsSync(join(preserveDir, "package.json"))).toBe(true);

        expect(existsSync(join(preserveDir, "websrc", "index.html"))).toBe(
          true,
        );
        expect(existsSync(join(preserveDir, "tkeron.d.ts"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should allow initializing in directory with only ignored files", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-allow-initializing-in-directory-with-only-ignored-files",
    );

    try {
      const dirWithGit = join(TEST_DIR, "dir-with-git");
      mkdirSync(dirWithGit, { recursive: true });
      mkdirSync(join(dirWithGit, ".git"), { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(dirWithGit);

      try {
        await init({ projectName: ".", logger: silentLogger });

        expect(existsSync(join(dirWithGit, "websrc"))).toBe(true);
        expect(existsSync(join(dirWithGit, "tkeron.d.ts"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle partial tkeron files - only src exists", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-handle-partial-tkeron-files-only-src-exists",
    );

    try {
      const partialDir = join(TEST_DIR, "partial-src-dir");
      mkdirSync(partialDir, { recursive: true });
      mkdirSync(join(partialDir, "websrc"), { recursive: true });
      writeFileSync(join(partialDir, "websrc", "old.js"), "old");

      const originalCwd = process.cwd();
      process.chdir(partialDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(partialDir, "websrc", "index.html"))).toBe(true);
        expect(existsSync(join(partialDir, "tkeron.d.ts"))).toBe(true);
        expect(existsSync(join(partialDir, "websrc", "old.js"))).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle partial tkeron files - only tkeron.d.ts exists", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-handle-partial-tkeron-files-only-tkeron-d-ts-exists",
    );

    try {
      const partialDir = join(TEST_DIR, "partial-dts-dir");
      mkdirSync(partialDir, { recursive: true });
      writeFileSync(join(partialDir, "tkeron.d.ts"), "old types");
      writeFileSync(join(partialDir, "README.md"), "readme");

      const originalCwd = process.cwd();
      process.chdir(partialDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(partialDir, "websrc"))).toBe(true);
        expect(existsSync(join(partialDir, "tkeron.d.ts"))).toBe(true);

        expect(existsSync(join(partialDir, "README.md"))).toBe(true);
        const readme = readFileSync(join(partialDir, "README.md"), "utf-8");
        expect(readme).toBe("readme");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle directory with .git and tkeron files together", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-handle-directory-with-git-and-tkeron-files-together",
    );

    try {
      const mixedDir = join(TEST_DIR, "git-and-tkeron-dir");
      mkdirSync(mixedDir, { recursive: true });
      mkdirSync(join(mixedDir, ".git"), { recursive: true });
      mkdirSync(join(mixedDir, "websrc"), { recursive: true });
      writeFileSync(join(mixedDir, "websrc", "old.txt"), "old");

      const originalCwd = process.cwd();
      process.chdir(mixedDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(mixedDir, "websrc", "index.html"))).toBe(true);
        expect(existsSync(join(mixedDir, "tkeron.d.ts"))).toBe(true);

        expect(existsSync(join(mixedDir, ".git"))).toBe(true);

        expect(existsSync(join(mixedDir, "websrc", "old.txt"))).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle multiple non-tkeron files with tkeron files", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-handle-multiple-non-tkeron-files-with-tkeron-files",
    );

    try {
      const multipleDir = join(TEST_DIR, "multiple-files-dir");
      mkdirSync(multipleDir, { recursive: true });
      mkdirSync(join(multipleDir, "websrc"), { recursive: true });
      writeFileSync(join(multipleDir, "package.json"), "{}");
      writeFileSync(join(multipleDir, ".gitignore"), "node_modules");
      writeFileSync(join(multipleDir, "README.md"), "readme");
      mkdirSync(join(multipleDir, "docs"), { recursive: true });
      writeFileSync(join(multipleDir, "docs", "guide.md"), "guide");

      const originalCwd = process.cwd();
      process.chdir(multipleDir);

      try {
        await init({ projectName: ".", force: true, logger: silentLogger });

        expect(existsSync(join(multipleDir, "websrc", "index.html"))).toBe(
          true,
        );
        expect(existsSync(join(multipleDir, "tkeron.d.ts"))).toBe(true);

        expect(existsSync(join(multipleDir, "package.json"))).toBe(true);
        expect(existsSync(join(multipleDir, ".gitignore"))).toBe(true);
        expect(existsSync(join(multipleDir, "README.md"))).toBe(true);
        expect(existsSync(join(multipleDir, "docs"))).toBe(true);
        expect(existsSync(join(multipleDir, "docs", "guide.md"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle user decline prompt with force flag bypassing prompt", async () => {
    const { dir: TEST_DIR } = getTestResources("init-should-handle-force-flag");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });

      mkdirSync(join(currentDir, "websrc"), { recursive: true });
      writeFileSync(
        join(currentDir, "websrc", "index.html"),
        "<h1>Old Content</h1>",
      );
      writeFileSync(join(currentDir, "tkeron.d.ts"), "// old declarations");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({
          projectName: ".",
          force: true,
          logger: testLogger.logger,
        });

        expect(existsSync(join(currentDir, "websrc", "index.html"))).toBe(true);
        const newContent = readFileSync(
          join(currentDir, "websrc", "index.html"),
          "utf-8",
        );
        expect(newContent).not.toContain("Old Content");
        expect(
          testLogger.logs.some((l) =>
            l.includes("✓ Cleaned existing tkeron files"),
          ),
        ).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should throw error if template directory is not found", async () => {
    const { dir: TEST_DIR } = getTestResources("init-template-not-found");

    try {
      await import("../src/init");

      const projectName = "test-project";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(projectPath)).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle user declining overwrite with injectable prompt", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-user-declines-with-prompt",
    );
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      mkdirSync(join(currentDir, "websrc"), { recursive: true });
      writeFileSync(join(currentDir, "websrc", "index.html"), "<h1>Old</h1>");
      writeFileSync(join(currentDir, "tkeron.d.ts"), "// old");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (question: string) => false;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        const websrcContent = readFileSync(
          join(currentDir, "websrc", "index.html"),
          "utf-8",
        );
        expect(websrcContent).toBe("<h1>Old</h1>");

        const dtsContent = readFileSync(
          join(currentDir, "tkeron.d.ts"),
          "utf-8",
        );
        expect(dtsContent).not.toBe("// old");

        expect(
          testLogger.logs.some((l) => l.includes("✓ Created project")),
        ).toBe(true);
        expect(
          testLogger.logs.some((l) => l.includes("❌ Operation cancelled.")),
        ).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle user accepting overwrite with injectable prompt", async () => {
    const { dir: TEST_DIR } = getTestResources("init-user-accepts-with-prompt");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      mkdirSync(join(currentDir, "websrc"), { recursive: true });
      writeFileSync(join(currentDir, "websrc", "index.html"), "<h1>Old</h1>");
      writeFileSync(join(currentDir, "tkeron.d.ts"), "// old");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (question: string) => true;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        expect(existsSync(join(currentDir, "websrc", "index.html"))).toBe(true);
        const newContent = readFileSync(
          join(currentDir, "websrc", "index.html"),
          "utf-8",
        );
        expect(newContent).not.toContain("Old");
        expect(
          testLogger.logs.some((l) =>
            l.includes("✓ Cleaned existing tkeron files"),
          ),
        ).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should display correct project name when initializing in current directory", async () => {
    const { dir: TEST_DIR } = getTestResources("init-display-name-current-dir");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "my-project-name");
      mkdirSync(currentDir, { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: testLogger.logger });

        const createLog = testLogger.logs.find((l) =>
          l.includes("✓ Created project"),
        );
        expect(createLog).toBeDefined();
        expect(createLog).toContain("my-project-name");
        expect(createLog).not.toContain('✓ Created project "."');
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should display correct next steps when initializing in current directory", async () => {
    const { dir: TEST_DIR } = getTestResources("init-next-steps-current-dir");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "project");
      mkdirSync(currentDir, { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: testLogger.logger });

        expect(testLogger.logs.some((l) => l.includes("Next steps:"))).toBe(
          true,
        );
        expect(testLogger.logs.some((l) => l.includes("tk dev websrc"))).toBe(
          true,
        );
        expect(testLogger.logs.some((l) => l.includes("cd "))).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should display correct next steps when initializing new directory", async () => {
    const { dir: TEST_DIR } = getTestResources("init-next-steps-new-dir");
    const testLogger = createTestLogger();

    try {
      const projectName = "new-project";
      const projectPath = join(TEST_DIR, projectName);

      await init({ projectName: projectPath, logger: testLogger.logger });

      expect(testLogger.logs.some((l) => l.includes("Next steps:"))).toBe(true);
      expect(testLogger.logs.some((l) => l.includes(`cd ${projectPath}`))).toBe(
        true,
      );
      expect(testLogger.logs.some((l) => l.includes("tk dev websrc"))).toBe(
        true,
      );
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should display warning message when tkeron files exist without force", async () => {
    const { dir: TEST_DIR } = getTestResources("init-warning-message");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      mkdirSync(join(currentDir, "websrc"), { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (question: string) => false;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        expect(testLogger.logs.some((l) => l.includes("⚠️"))).toBe(true);
        expect(
          testLogger.logs.some((l) => l.includes("tkeron files already exist")),
        ).toBe(true);
        expect(testLogger.logs.some((l) => l.includes("websrc"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle only tkeron.d.ts existing (show in warning)", async () => {
    const { dir: TEST_DIR } = getTestResources("init-only-dts-warning");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(join(currentDir, "tkeron.d.ts"), "// old");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (question: string) => false;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        const warningLog = testLogger.logs.find((l) =>
          l.includes("tkeron files already exist"),
        );
        expect(warningLog).toBeDefined();
        expect(warningLog).toContain("tkeron.d.ts");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle both src and tkeron.d.ts existing (show in warning)", async () => {
    const { dir: TEST_DIR } = getTestResources("init-both-files-warning");
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      mkdirSync(join(currentDir, "websrc"), { recursive: true });
      writeFileSync(join(currentDir, "tkeron.d.ts"), "// old");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (question: string) => false;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        const warningLog = testLogger.logs.find((l) =>
          l.includes("tkeron files already exist"),
        );
        expect(warningLog).toBeDefined();
        expect(warningLog).toContain("websrc");
        expect(warningLog).toContain("tkeron.d.ts");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should create tsconfig.json when creating a new project", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-create-tsconfig-json-new-project",
    );

    try {
      const projectName = "tsconfig-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      expect(existsSync(join(projectPath, "tsconfig.json"))).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should create tsconfig.json that includes tkeron.d.ts for IDE detection", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-create-tsconfig-with-tkeron-dts",
    );

    try {
      const projectName = "tsconfig-dts-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      const tsconfig = JSON.parse(
        readFileSync(join(projectPath, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.include).toBeDefined();
      expect(tsconfig.include).toContain("tkeron.d.ts");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should create tsconfig.json that includes websrc sources", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-create-tsconfig-with-websrc",
    );

    try {
      const projectName = "tsconfig-websrc-test";
      const projectPath = join(TEST_DIR, projectName);

      await init({
        projectName: join(TEST_DIR, projectName),
        logger: silentLogger,
      });

      const tsconfig = JSON.parse(
        readFileSync(join(projectPath, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.include).toBeDefined();
      const hasWebsrc = tsconfig.include.some((entry: string) =>
        entry.includes("websrc"),
      );
      expect(hasWebsrc).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should create tsconfig.json when initializing in current directory", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-create-tsconfig-current-dir",
    );

    try {
      const currentDir = join(TEST_DIR, "my-project");
      mkdirSync(currentDir, { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        expect(existsSync(join(currentDir, "tsconfig.json"))).toBe(true);
        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        expect(tsconfig.include).toContain("tkeron.d.ts");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should not include tsconfig.json in tkeron-managed files warning", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-not-include-tsconfig-in-tkeron-files-warning",
    );
    const testLogger = createTestLogger();

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      mkdirSync(join(currentDir, "websrc"), { recursive: true });
      writeFileSync(join(currentDir, "tsconfig.json"), "{}");

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        const mockPrompt = async (_question: string) => false;

        await init({
          projectName: ".",
          promptFn: mockPrompt,
          logger: testLogger.logger,
        });

        const warningLog = testLogger.logs.find((l) =>
          l.includes("tkeron files already exist"),
        );
        expect(warningLog).not.toContain("tsconfig.json");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should merge tkeron.d.ts into existing tsconfig include", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-merge-tkeron-dts-into-existing-tsconfig",
    );

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { target: "ESNext", strict: true },
          include: ["src/**/*"],
        }),
      );

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        expect(tsconfig.include).toContain("tkeron.d.ts");
        expect(tsconfig.include).toContain("src/**/*");
        expect(tsconfig.compilerOptions.strict).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should merge websrc into existing tsconfig include", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-merge-websrc-into-existing-tsconfig",
    );

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, "tsconfig.json"),
        JSON.stringify({ include: ["other/**/*"] }),
      );

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        const hasWebsrc = tsconfig.include.some((e: string) =>
          e.includes("websrc"),
        );
        expect(hasWebsrc).toBe(true);
        expect(tsconfig.include).toContain("other/**/*");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should not duplicate entries when merging into existing tsconfig", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-not-duplicate-tsconfig-entries",
    );

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, "tsconfig.json"),
        JSON.stringify({ include: ["websrc/**/*", "tkeron.d.ts"] }),
      );

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        const dtsCount = tsconfig.include.filter(
          (e: string) => e === "tkeron.d.ts",
        ).length;
        const websrcCount = tsconfig.include.filter((e: string) =>
          e.includes("websrc"),
        ).length;
        expect(dtsCount).toBe(1);
        expect(websrcCount).toBe(1);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should create include array in existing tsconfig that has none", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-add-include-to-tsconfig-without-include",
    );

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { strict: true } }),
      );

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        expect(tsconfig.include).toBeDefined();
        expect(tsconfig.include).toContain("tkeron.d.ts");
        const hasWebsrc = tsconfig.include.some((e: string) =>
          e.includes("websrc"),
        );
        expect(hasWebsrc).toBe(true);
        expect(tsconfig.compilerOptions.strict).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should preserve existing tsconfig settings when merging", async () => {
    const { dir: TEST_DIR } = getTestResources(
      "init-should-preserve-tsconfig-settings-on-merge",
    );

    try {
      const currentDir = join(TEST_DIR, "current");
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            target: "ES2020",
            strict: false,
            paths: { "@/*": ["./src/*"] },
          },
          exclude: ["node_modules", "dist"],
          include: ["src/**/*"],
        }),
      );

      const originalCwd = process.cwd();
      process.chdir(currentDir);

      try {
        await init({ projectName: ".", logger: silentLogger });

        const tsconfig = JSON.parse(
          readFileSync(join(currentDir, "tsconfig.json"), "utf-8"),
        );
        expect(tsconfig.compilerOptions.target).toBe("ES2020");
        expect(tsconfig.compilerOptions.strict).toBe(false);
        expect(tsconfig.compilerOptions.paths).toEqual({ "@/*": ["./src/*"] });
        expect(tsconfig.exclude).toEqual(["node_modules", "dist"]);
        expect(tsconfig.include).toContain("src/**/*");
        expect(tsconfig.include).toContain("tkeron.d.ts");
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });
});
