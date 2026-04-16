import { describe, it, expect } from "bun:test";
import { deduplicateComStyles } from "../src/deduplicateComStyles.js";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources } from "./test-helpers";

describe("deduplicateComStyles", () => {
  it("should remove duplicate styles with same data-tk-com", async () => {
    const { dir } = getTestResources("dedup-basic");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head></head>
<body>
  <style data-tk-com="card">.card { color: red; }</style>
  <div class="card">First</div>
  <style data-tk-com="card">.card { color: red; }</style>
  <div class="card">Second</div>
</body>
</html>`,
      );
      await deduplicateComStyles(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      const matches = result.match(/data-tk-com="card"/g);
      expect(matches?.length).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should move surviving style to head", async () => {
    const { dir } = getTestResources("dedup-move-to-head");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head></head>
<body>
  <style data-tk-com="btn">.btn { font-size: 1rem; }</style>
  <button class="btn">Click</button>
  <style data-tk-com="btn">.btn { font-size: 1rem; }</style>
  <button class="btn">Click 2</button>
</body>
</html>`,
      );
      await deduplicateComStyles(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      const headMatch = result.match(/<head>([\s\S]*?)<\/head>/);
      expect(headMatch?.[1]).toContain('data-tk-com="btn"');
      const bodyMatch = result.match(/<body>([\s\S]*?)<\/body>/);
      expect(bodyMatch?.[1]).not.toContain('data-tk-com="btn"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should handle multiple different tk-coms", async () => {
    const { dir } = getTestResources("dedup-multiple-ids");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head></head>
<body>
  <style data-tk-com="card">.card{}</style>
  <style data-tk-com="btn">.btn{}</style>
  <style data-tk-com="card">.card{}</style>
  <style data-tk-com="btn">.btn{}</style>
  <style data-tk-com="card">.card{}</style>
</body>
</html>`,
      );
      await deduplicateComStyles(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      const cardMatches = result.match(/data-tk-com="card"/g);
      const btnMatches = result.match(/data-tk-com="btn"/g);
      expect(cardMatches?.length).toBe(1);
      expect(btnMatches?.length).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should not modify html with no duplicate styles", async () => {
    const { dir } = getTestResources("dedup-no-duplicates");
    try {
      mkdirSync(dir, { recursive: true });
      const original = `<!DOCTYPE html>
<html>
<head><style data-tk-com="card">.card{}</style></head>
<body><div class="card">Hello</div></body>
</html>`;
      writeFileSync(join(dir, "index.html"), original);
      await deduplicateComStyles(dir);
      const result = readFileSync(join(dir, "index.html"), "utf-8");
      const matches = result.match(/data-tk-com="card"/g);
      expect(matches?.length).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should handle html with no component styles at all", async () => {
    const { dir } = getTestResources("dedup-no-styles");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head></head>
<body><p>Hello</p></body>
</html>`,
      );
      await expect(deduplicateComStyles(dir)).resolves.toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should process multiple html files in the dir", async () => {
    const { dir } = getTestResources("dedup-multiple-files");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "page1.html"),
        `<!DOCTYPE html><html><head></head><body>
  <style data-tk-com="x">.x{}</style>
  <style data-tk-com="x">.x{}</style>
</body></html>`,
      );
      writeFileSync(
        join(dir, "page2.html"),
        `<!DOCTYPE html><html><head></head><body>
  <style data-tk-com="y">.y{}</style>
  <style data-tk-com="y">.y{}</style>
</body></html>`,
      );
      await deduplicateComStyles(dir);
      const r1 = readFileSync(join(dir, "page1.html"), "utf-8");
      const r2 = readFileSync(join(dir, "page2.html"), "utf-8");
      expect(r1.match(/data-tk-com="x"/g)?.length).toBe(1);
      expect(r2.match(/data-tk-com="y"/g)?.length).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should return early without error for invalid tempDir", async () => {
    await expect(deduplicateComStyles("")).resolves.toBeUndefined();
    await expect(deduplicateComStyles(null as any)).resolves.toBeUndefined();
  });
});
