import { describe, it, expect } from "bun:test";
import { processPost } from "../src/processPost";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources, createTestLogger } from "./test-helpers";

describe("processPost", () => {
  it("should process .post.ts and modify the paired .html", async () => {
    const { dir } = getTestResources("processPost-basic");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head><title>Original</title></head>
<body><p id="msg">Hello</p></body>
</html>`,
      );
      writeFileSync(
        join(dir, "index.post.ts"),
        `
const msg = document.getElementById("msg");
if (msg) msg.textContent = "Modified by post";
`,
      );
      await processPost(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      expect(result).toContain("Modified by post");
      expect(result).not.toContain("Hello");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should return true when .post.ts files exist", async () => {
    const { dir } = getTestResources("processPost-returns-true");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "page.html"),
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      writeFileSync(join(dir, "page.post.ts"), `// no-op`);
      const result = await processPost(dir);
      expect(result).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should return false when no .post.ts files exist", async () => {
    const { dir } = getTestResources("processPost-returns-false");
    try {
      mkdirSync(dir, { recursive: true });
      const result = await processPost(dir);
      expect(result).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should process multiple .post.ts files independently", async () => {
    const { dir } = getTestResources("processPost-multiple");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "page1.html"),
        `<!DOCTYPE html><html><head></head><body><p id="x">A</p></body></html>`,
      );
      writeFileSync(
        join(dir, "page2.html"),
        `<!DOCTYPE html><html><head></head><body><p id="y">B</p></body></html>`,
      );
      writeFileSync(
        join(dir, "page1.post.ts"),
        `const el = document.getElementById("x"); if (el) el.textContent = "Post1";`,
      );
      writeFileSync(
        join(dir, "page2.post.ts"),
        `const el = document.getElementById("y"); if (el) el.textContent = "Post2";`,
      );
      await processPost(dir);
      const out1 = readFileSync(join(dir, "page1.html"), "utf-8");
      const out2 = readFileSync(join(dir, "page2.html"), "utf-8");
      expect(out1).toContain("Post1");
      expect(out2).toContain("Post2");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should receive the current HTML content (post-components)", async () => {
    const { dir } = getTestResources("processPost-receives-current-html");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html><html><head></head><body><div class="component-output">expanded</div></body></html>`,
      );
      writeFileSync(
        join(dir, "index.post.ts"),
        `
const div = document.querySelector(".component-output");
if (div) div.setAttribute("data-processed", "true");
`,
      );
      await processPost(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      expect(result).toContain('data-processed="true"');
      expect(result).toContain("expanded");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should throw when .post.ts has a syntax error", async () => {
    const { dir } = getTestResources("processPost-syntax-error");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "page.html"),
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      writeFileSync(join(dir, "page.post.ts"), `const x = ;`);
      let thrown = false;
      try {
        await processPost(dir);
      } catch (e: any) {
        thrown = true;
        expect(e.message).toContain("Post-processing failed");
      }
      expect(thrown).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should throw when .post.ts has a runtime error", async () => {
    const { dir } = getTestResources("processPost-runtime-error");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "page.html"),
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      writeFileSync(
        join(dir, "page.post.ts"),
        `throw new Error("Runtime error during post");`,
      );
      let thrown = false;
      try {
        await processPost(dir);
      } catch (e: any) {
        thrown = true;
        expect(e.message).toContain("Post-processing failed");
      }
      expect(thrown).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should resolve relative imports within the directory", async () => {
    const { dir } = getTestResources("processPost-imports");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      writeFileSync(
        join(dir, "helper.ts"),
        `export const suffix = " (post-processed)";`,
      );
      writeFileSync(
        join(dir, "index.post.ts"),
        `
import { suffix } from "./helper";
const title = document.createElement("h1");
title.textContent = "Title" + suffix;
document.body.appendChild(title);
`,
      );
      await processPost(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      expect(result).toContain("Title (post-processed)");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should return false and log error for invalid tempDir", async () => {
    const { logger } = createTestLogger();
    const result = await processPost("", { logger });
    expect(result).toBe(false);
  });

  it("should preserve DOCTYPE in output", async () => {
    const { dir } = getTestResources("processPost-doctype");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      writeFileSync(
        join(dir, "index.post.ts"),
        `document.title = "After post";`,
      );
      await processPost(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      expect(result).toMatch(/^<!DOCTYPE html>/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
