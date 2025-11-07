import { describe, it, expect, beforeAll } from "bun:test";
import { build } from "./build";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getFilePaths } from "@tkeron/tools";

describe("Examples Build Snapshots", () => {
  const EXAMPLES_DIR = join(import.meta.dir, "..", "examples");
  
  const examples = [
    { name: "basic_build", src: "basic_build/src", out: "basic_build/webout" },
    { name: "with_assets", src: "with_assets/src", out: "with_assets/webout" },
  ];

  // Helper function to read all files recursively from a directory
  const readDirRecursive = (dir: string): Record<string, string> => {
    const files: Record<string, string> = {};
    const filePaths = getFilePaths(dir, "**/*", true);

    for (const fullPath of filePaths) {
      const relativePath = fullPath.substring(dir.length + 1).replace(/\\/g, '/');
      const content = readFileSync(fullPath, "utf-8");
      files[relativePath] = content;
    }

    return files;
  };

  for (const example of examples) {
    describe(example.name, () => {
      const srcDir = join(EXAMPLES_DIR, example.src);
      const outDir = join(EXAMPLES_DIR, example.out);

      beforeAll(async () => {
        // Build the example before testing
        await build({
          sourceDir: srcDir,
          targetDir: outDir,
        });
      });

      it("should generate expected output structure", () => {
        expect(existsSync(outDir)).toBe(true);
        expect(existsSync(join(outDir, "index.html"))).toBe(true);
        expect(existsSync(join(outDir, "index.js"))).toBe(true);
      });

      it("should match output snapshot", () => {
        const outputFiles = readDirRecursive(outDir);
        
        // Snapshot all generated files
        expect(outputFiles).toMatchSnapshot();
      });

      it("index.html should be valid and contain script reference", () => {
        const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
        
        // Check HTML is valid
        expect(htmlContent).toContain("<!doctype html>");
        expect(htmlContent).toContain("<html");
        expect(htmlContent).toContain("</html>");
        
        // Check script injection
        expect(htmlContent).toContain('src="./index.js"');
        expect(htmlContent).toContain('type="module"');
      });

      it("index.js should be generated and not empty", () => {
        const jsContent = readFileSync(join(outDir, "index.js"), "utf-8");
        
        expect(jsContent.length).toBeGreaterThan(0);
        // Should contain some bundled code
        expect(jsContent).toBeTruthy();
      });
    });
  }

  // Specific test for with_assets example
  describe("with_assets - asset handling", () => {
    const outDir = join(EXAMPLES_DIR, "with_assets/webout");

    it("should preserve directory structure for assets", () => {
      expect(existsSync(join(outDir, "section"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.html"))).toBe(true);
    });

    it("nested HTML files should also have script injection", () => {
      const nestedHtml = readFileSync(join(outDir, "section/index.html"), "utf-8");
      
      expect(nestedHtml).toContain('src="./index.js"');
      expect(nestedHtml).toContain('type="module"');
    });
  });
});
