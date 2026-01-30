import { describe, it, expect, spyOn } from "bun:test";
import { processPre } from "../src/processPre";
import {
  rmSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  readdirSync,
} from "fs";
import { join } from "path";
import {
  getTestResources,
  silentLogger,
  createTestLogger,
} from "./test-helpers";
describe("processPre", () => {
  it("should successfully process valid .pre.ts file", async () => {
    const { dir } = getTestResources("processPre-valid-file");
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
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should handle .pre.ts file with syntax error", async () => {
    const { dir } = getTestResources("processPre-syntax-error");
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
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should handle .pre.ts file with runtime error", async () => {
    const { dir } = getTestResources("processPre-runtime-error");
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
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should process multiple .pre.ts files independently", async () => {
    const { dir } = getTestResources("processPre-multiple-files");
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
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should use existing .html file as base when present", async () => {
    const { dir } = getTestResources("processPre-existing-html");
    try {
      mkdirSync(dir, { recursive: true });
      const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Original Title</title></head>
<body><div id="content">Original</div></body>
</html>`;
      writeFileSync(join(dir, "page.html"), htmlContent);
      const preContent = `
const content = document.getElementById("content");
if (content) content.textContent = "Modified by pre";
`;
      writeFileSync(join(dir, "page.pre.ts"), preContent);
      await processPre(dir);
      const outputHtml = readFileSync(join(dir, "page.html"), "utf-8");
      expect(outputHtml).toContain("Original Title");
      expect(outputHtml).toContain("Modified by pre");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should create default HTML when no .html file exists", async () => {
    const { dir } = getTestResources("processPre-default-html");
    try {
      mkdirSync(dir, { recursive: true });
      const preContent = `
const h1 = document.createElement("h1");
h1.textContent = "Created from default";
document.body.appendChild(h1);
`;
      writeFileSync(join(dir, "page.pre.ts"), preContent);
      await processPre(dir);
      expect(existsSync(join(dir, "page.html"))).toBe(true);
      const outputHtml = readFileSync(join(dir, "page.html"), "utf-8");
      expect(outputHtml).toContain("<!DOCTYPE html>");
      expect(outputHtml).toContain("Created from default");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("should resolve relative imports within temp directory", async () => {
    const { dir } = getTestResources("processPre-resolve-imports");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "my-utils.ts"),
        `export const greeting = "Hello from local module";`,
      );
      const preContent = `
import { greeting } from "./my-utils";
const h1 = document.createElement("h1");
h1.textContent = greeting;
document.body.appendChild(h1);
`;
      writeFileSync(join(dir, "page.pre.ts"), preContent);
      await processPre(dir);
      expect(existsSync(join(dir, "page.html"))).toBe(true);
      const outputHtml = readFileSync(join(dir, "page.html"), "utf-8");
      expect(outputHtml).toContain("Hello from local module");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should return false and log error when tempDir is invalid", async () => {
    const { logger, errors } = createTestLogger();

    // Test with empty string
    const result1 = await processPre("", { logger });
    expect(result1).toBe(false);
    expect(errors.some((e) => e.includes("Invalid tempDir"))).toBe(true);

    // Test with null-ish value
    const result2 = await processPre(null as any, { logger });
    expect(result2).toBe(false);
  });
});
