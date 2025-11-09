import { describe, it, expect, beforeAll } from "bun:test";
import { build } from "./build";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parseHTML } from "@tkeron/html-parser";

describe("Examples Build Tests", () => {
  const EXAMPLES_DIR = join(import.meta.dir, "..", "examples");

  describe("basic_build", () => {
    const srcDir = join(EXAMPLES_DIR, "basic_build/src");
    const outDir = join(EXAMPLES_DIR, "basic_build/webout");

    beforeAll(async () => {
      await build({
        sourceDir: srcDir,
        targetDir: outDir,
      });
    });

    it("should generate index.html and index.js", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("index.html should have valid structure with script injection", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(htmlContent);
      
      // Check basic structure
      expect(htmlContent).toContain("<!doctype html>");
      expect(doc.querySelector("html")).toBeTruthy();
      expect(doc.querySelector("head")).toBeTruthy();
      expect(doc.querySelector("body")).toBeTruthy();
      
      // Check script injection
      const script = doc.querySelector('script[type="module"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute("src")).toBe("./index.js");
      expect(script?.hasAttribute("crossorigin")).toBe(true);
      expect(script?.parentElement?.tagName).toBe("HEAD");
    });

    it("index.js should contain bundled code", () => {
      const jsContent = readFileSync(join(outDir, "index.js"), "utf-8");
      
      expect(jsContent.length).toBeGreaterThan(0);
      expect(jsContent).toContain("button");
      expect(jsContent).toContain("querySelector");
    });
  });

  describe("with_assets", () => {
    const srcDir = join(EXAMPLES_DIR, "with_assets/src");
    const outDir = join(EXAMPLES_DIR, "with_assets/webout");

    beforeAll(async () => {
      await build({
        sourceDir: srcDir,
        targetDir: outDir,
      });
    });

    it("should generate main files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("should preserve directory structure for nested HTML", () => {
      expect(existsSync(join(outDir, "section"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.html"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.js"))).toBe(true);
    });

    it("index.html should contain image reference", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(htmlContent);
      
      // Check script injection
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
      
      // Check image reference
      const img = doc.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toContain("profile.png");
      expect(img?.getAttribute("alt")).toBe("tkeron profile picture");
    });

    it("nested HTML should have script injection", () => {
      const nestedHtml = readFileSync(join(outDir, "section/index.html"), "utf-8");
      const doc = parseHTML(nestedHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
      
      // Check relative image path
      const img = doc.querySelector("img");
      expect(img?.getAttribute("src")).toBe("../profile.png");
    });
  });

  describe("with_pre", () => {
    const srcDir = join(EXAMPLES_DIR, "with_pre/src");
    const outDir = join(EXAMPLES_DIR, "with_pre/webout");

    beforeAll(async () => {
      await build({
        sourceDir: srcDir,
        targetDir: outDir,
      });
    });

    it("should generate files from .pre.ts files", () => {
      expect(existsSync(join(outDir, "contact.html"))).toBe(true);
      expect(existsSync(join(outDir, "contact.js"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.html"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.js"))).toBe(true);
    });

    it("should generate standard files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("pre-generated contact.html should have script with correct path", () => {
      const contactHtml = readFileSync(join(outDir, "contact.html"), "utf-8");
      const doc = parseHTML(contactHtml);
      
      // Verify script injection with correct path
      const script = doc.querySelector('script[type="module"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute("src")).toBe("./contact.js");
      expect(script?.hasAttribute("crossorigin")).toBe(true);
      
      // Verify content
      const h1 = doc.querySelector("h1");
      expect(h1?.textContent).toBe("Contact Us");
    });

    it("pre-generated section/index.html should have script with correct path", () => {
      const sectionHtml = readFileSync(join(outDir, "section/index.html"), "utf-8");
      const doc = parseHTML(sectionHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
    });

    it("regular index.html should have script injection", () => {
      const indexHtml = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(indexHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
    });
  });

});
