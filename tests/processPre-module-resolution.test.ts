import { it, describe, expect } from "bun:test";
import { join } from "path";
import { rm, mkdir } from "fs/promises";
import { processPre } from "../src/processPre";
import { createTestLogger } from "@tkeron/tools";

describe("processPre - Module Resolution", () => {
  it("should resolve modules from project root, not temp directory", async () => {
    const testRoot = join(
      import.meta.dir,
      "temp-module-resolution-test",
      crypto.randomUUID(),
    );
    const tempDir = join(testRoot, ".tktmp_test");

    try {
      await mkdir(tempDir, { recursive: true });

      const preFileContent = `
        import { parseHTML } from "@tkeron/html-parser";
        const doc = parseHTML("<div>Module resolution test</div>");
        console.log("SUCCESS");
      `;

      await Bun.write(join(tempDir, "test.pre.ts"), preFileContent);
      await Bun.write(join(tempDir, "test.html"), "<html></html>");

      const { logger, logs } = createTestLogger();

      const result = await processPre(tempDir, {
        logger,
        projectRoot: testRoot,
      });

      expect(result).toBe(true);
      expect(logs.some((log) => log.includes("Pre-rendering failed"))).toBe(
        false,
      );
    } finally {
      await rm(testRoot, { recursive: true, force: true });
    }
  }, 15000);

  it("should use temp directory as fallback when projectRoot is not provided", async () => {
    const testRoot = join(
      import.meta.dir,
      "temp-module-resolution-fallback-test",
      crypto.randomUUID(),
    );
    const tempDir = join(testRoot, ".tktmp_test");

    try {
      await mkdir(tempDir, { recursive: true });

      const preFileContent = `
        const message = "Fallback works";
        console.log(message);
      `;

      await Bun.write(join(tempDir, "test.pre.ts"), preFileContent);
      await Bun.write(join(tempDir, "test.html"), "<html></html>");

      const { logger, logs } = createTestLogger();

      const result = await processPre(tempDir, { logger });

      expect(result).toBe(true);
      expect(logs.some((log) => log.includes("Pre-rendering failed"))).toBe(
        false,
      );
    } finally {
      await rm(testRoot, { recursive: true, force: true });
    }
  }, 15000);
});
