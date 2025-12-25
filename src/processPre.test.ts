import { describe, it, expect, spyOn } from "bun:test";
import { processPre } from "./processPre";
import { rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources } from "./test-helpers";

describe("processPre", () => {
  it("should successfully process valid .pre.ts file", async () => {
    const { dir } = getTestResources("processPre-valid-file");
    const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    try {
      mkdirSync(dir, { recursive: true });

      const preContent = `
const title = document.createElement("title");
title.textContent = "Test Title";
document.head.appendChild(title);

const h1 = document.createElement("h1");
h1.textContent = "Test Content";
document.body.appendChild(h1);
`;

      writeFileSync(join(dir, "page.pre.ts"), preContent);

      await processPre(dir);

      expect(existsSync(join(dir, "page.html"))).toBe(true);
      const outputHtml = readFileSync(join(dir, "page.html"), "utf-8");
      expect(outputHtml).toContain("Test Title");
      expect(outputHtml).toContain("Test Content");
    } finally {
      consoleLogSpy?.mockRestore();
      consoleErrorSpy?.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should handle .pre.ts file with syntax error", async () => {
    const { dir } = getTestResources("processPre-syntax-error");
    const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    try {
      mkdirSync(dir, { recursive: true });

      const preContent = `const x = ;  // Syntax error`;

      writeFileSync(join(dir, "error.pre.ts"), preContent);
      
      let errorThrown = false;
      try {
        await processPre(dir);
      } catch (error: any) {
        errorThrown = true;
        expect(error.message).toContain("Pre-rendering failed");
      }

      expect(errorThrown).toBe(true);
    } finally {
      consoleLogSpy?.mockRestore();
      consoleErrorSpy?.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should handle .pre.ts file with runtime error", async () => {
    const { dir } = getTestResources("processPre-runtime-error");
    const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    try {
      mkdirSync(dir, { recursive: true });

      const preContent = `throw new Error("Runtime error during pre-render");`;

      writeFileSync(join(dir, "runtime-error.pre.ts"), preContent);
      
      let errorThrown = false;
      try {
        await processPre(dir);
      } catch (error: any) {
        errorThrown = true;
        expect(error.message).toContain("Pre-rendering failed");
      }

      expect(errorThrown).toBe(true);
    } finally {
      consoleLogSpy?.mockRestore();
      consoleErrorSpy?.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should process multiple .pre.ts files independently", async () => {
    const { dir } = getTestResources("processPre-multiple-files");
    const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    try {
      mkdirSync(dir, { recursive: true });

      const preContent1 = `
const h1 = document.createElement("h1");
h1.textContent = "Page 1";
document.body.appendChild(h1);
`;
      const preContent2 = `
const h1 = document.createElement("h1");
h1.textContent = "Page 2";
document.body.appendChild(h1);
`;

      writeFileSync(join(dir, "page1.pre.ts"), preContent1);
      writeFileSync(join(dir, "page2.pre.ts"), preContent2);
      
      await processPre(dir);

      expect(existsSync(join(dir, "page1.html"))).toBe(true);
      expect(existsSync(join(dir, "page2.html"))).toBe(true);

      const output1 = readFileSync(join(dir, "page1.html"), "utf-8");
      const output2 = readFileSync(join(dir, "page2.html"), "utf-8");
      
      expect(output1).toContain("Page 1");
      expect(output2).toContain("Page 2");
    } finally {
      consoleLogSpy?.mockRestore();
      consoleErrorSpy?.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
