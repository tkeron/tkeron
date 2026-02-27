import { describe, it, expect } from "bun:test";
import { join } from "path";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { getTestResources, createTestLogger } from "./test-helpers";
import { getBuildResult } from "../src/getBuildResult";

describe("getBuildResult", () => {
  describe("basic HTML build", () => {
    it("should return BuildResult with index.html entry", async () => {
      const { dir } = getTestResources("getBuildResult-basic-html");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><div id="test">Hello</div></body></html>',
        );

        const result = await getBuildResult(srcDir);

        expect(result).toBeDefined();
        expect(result["index.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include parsed DOM for HTML files", async () => {
      const { dir } = getTestResources("getBuildResult-dom-parsed");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><div id="my_component">my component content</div></body></html>',
        );

        const result = await getBuildResult(srcDir);
        const dom = result["index.html"]!.dom;

        expect(dom).toBeDefined();
        const myComponent = dom!.getElementById("my_component");
        expect(myComponent).toBeDefined();
        expect(myComponent!.innerHTML).toBe("my component content");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should allow querying DOM elements", async () => {
      const { dir } = getTestResources("getBuildResult-dom-query");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          `<!DOCTYPE html><html><head><title>Test</title></head><body>
            <header class="main-header">Header</header>
            <nav id="nav"><a href="/">Home</a></nav>
            <main><article><h1>Title</h1><p>Content</p></article></main>
          </body></html>`,
        );

        const result = await getBuildResult(srcDir);
        const dom = result["index.html"]!.dom!;

        expect(dom.querySelector("header.main-header")).toBeDefined();
        expect(dom.querySelector("#nav a")?.getAttribute("href")).toBe("/");
        expect(dom.querySelector("article h1")?.innerHTML).toBe("Title");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("file metadata", () => {
    it("should include fileName property", async () => {
      const { dir } = getTestResources("getBuildResult-fileName");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.fileName).toBe("index.html");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include filePath property (empty for root files)", async () => {
      const { dir } = getTestResources("getBuildResult-filePath-root");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.filePath).toBe("");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include path property (full relative path)", async () => {
      const { dir } = getTestResources("getBuildResult-path");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.path).toBe("index.html");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include correct MIME type for HTML", async () => {
      const { dir } = getTestResources("getBuildResult-mime-html");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.type).toBe("text/html");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include size in bytes", async () => {
      const { dir } = getTestResources("getBuildResult-size");
      const srcDir = join(dir, "websrc");
      const content = "<!DOCTYPE html><html><head></head><body></body></html>";

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(join(srcDir, "index.html"), content);

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.size).toBeGreaterThan(0);
        expect(typeof result["index.html"]!.size).toBe("number");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include fileHash", async () => {
      const { dir } = getTestResources("getBuildResult-hash");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.fileHash).toBeDefined();
        expect(typeof result["index.html"]!.fileHash).toBe("string");
        expect(result["index.html"]!.fileHash.length).toBeGreaterThan(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("getContentAsString", () => {
    it("should include getContentAsString for text files", async () => {
      const { dir } = getTestResources("getBuildResult-getContent");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body>Test Content</body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(typeof result["index.html"]!.getContentAsString).toBe(
          "function",
        );
        const content = result["index.html"]!.getContentAsString!();
        expect(content).toContain("Test Content");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should return correct content for CSS linked in HTML", async () => {
      const { dir } = getTestResources("getBuildResult-css-linked");
      const srcDir = join(dir, "websrc");
      const cssContent = "body { background: red; }";

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body></body></html>',
        );
        writeFileSync(join(srcDir, "style.css"), cssContent);

        const result = await getBuildResult(srcDir);

        expect(result["index.css"]).toBeDefined();
        expect(result["index.css"]!.getContentAsString).toBeDefined();
        expect(result["index.css"]!.getContentAsString!()).toContain(
          "background",
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should be a lazy function (closure)", async () => {
      const { dir } = getTestResources("getBuildResult-lazy");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);
        const getter = result["index.html"]!.getContentAsString;

        expect(typeof getter).toBe("function");
        const content1 = getter!();
        const content2 = getter!();
        expect(content1).toBe(content2);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("multiple file types", () => {
    it("should handle CSS files linked in HTML with correct MIME type", async () => {
      const { dir } = getTestResources("getBuildResult-css-mime");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body></body></html>',
        );
        writeFileSync(join(srcDir, "style.css"), "body { margin: 0; }");

        const result = await getBuildResult(srcDir);

        expect(result["index.css"]).toBeDefined();
        expect(result["index.css"]!.type).toBe("text/css");
        expect(result["index.css"]!.dom).toBeUndefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should NOT include dom for non-HTML files", async () => {
      const { dir } = getTestResources("getBuildResult-no-dom-css");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><script src="script.js"></script></body></html>',
        );
        writeFileSync(join(srcDir, "style.css"), "body {}");
        writeFileSync(join(srcDir, "script.js"), "console.log('test')");

        const result = await getBuildResult(srcDir);

        expect(result["index.css"]).toBeDefined();
        expect(result["index.css"]!.dom).toBeUndefined();
        expect(result["index.html"]!.dom).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("binary files referenced in HTML", () => {
    it("should NOT include getContentAsString for binary image files", async () => {
      const { dir } = getTestResources("getBuildResult-binary-no-content");
      const srcDir = join(dir, "websrc");
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
        0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><img src="image.png"></body></html>',
        );
        writeFileSync(join(srcDir, "image.png"), pngData);

        const result = await getBuildResult(srcDir);

        expect(result["image.png"]).toBeDefined();
        expect(result["image.png"]!.getContentAsString).toBeUndefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should have correct MIME type for PNG images", async () => {
      const { dir } = getTestResources("getBuildResult-png-mime");
      const srcDir = join(dir, "websrc");
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
        0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><img src="photo.png"></body></html>',
        );
        writeFileSync(join(srcDir, "photo.png"), pngData);

        const result = await getBuildResult(srcDir);

        expect(result["photo.png"]).toBeDefined();
        expect(result["photo.png"]!.type).toBe("image/png");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should include size for image files", async () => {
      const { dir } = getTestResources("getBuildResult-binary-size");
      const srcDir = join(dir, "websrc");
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
        0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><img src="data.png"></body></html>',
        );
        writeFileSync(join(srcDir, "data.png"), pngData);

        const result = await getBuildResult(srcDir);

        expect(result["data.png"]).toBeDefined();
        expect(result["data.png"]!.size).toBe(pngData.length);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("directory structure", () => {
    it("should handle HTML files in subdirectories with correct paths", async () => {
      const { dir } = getTestResources("getBuildResult-subdirs");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(join(srcDir, "pages"), { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );
        writeFileSync(
          join(srcDir, "pages", "about.html"),
          "<!DOCTYPE html><html><head></head><body><h1>About</h1></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["pages/about.html"]).toBeDefined();
        expect(result["pages/about.html"]!.fileName).toBe("about.html");
        expect(result["pages/about.html"]!.filePath).toBe("pages");
        expect(result["pages/about.html"]!.path).toBe("pages/about.html");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should handle images referenced in HTML", async () => {
      const { dir } = getTestResources("getBuildResult-images");
      const srcDir = join(dir, "websrc");
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><img src="logo.png"></body></html>',
        );
        writeFileSync(join(srcDir, "logo.png"), pngData);

        const result = await getBuildResult(srcDir);

        expect(result["logo.png"]).toBeDefined();
        expect(result["logo.png"]!.type).toBe("image/png");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should handle multiple HTML files in different directories", async () => {
      const { dir } = getTestResources("getBuildResult-multi-html");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(join(srcDir, "pages"), { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><div id="home">Home</div></body></html>',
        );
        writeFileSync(
          join(srcDir, "pages", "about.html"),
          '<!DOCTYPE html><html><head></head><body><div id="about">About</div></body></html>',
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]!.dom!.getElementById("home")).toBeDefined();
        expect(
          result["pages/about.html"]!.dom!.getElementById("about"),
        ).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("logger option", () => {
    it("should accept custom logger", async () => {
      const { dir } = getTestResources("getBuildResult-custom-logger");
      const srcDir = join(dir, "websrc");
      const { logger } = createTestLogger();

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir, { logger });

        expect(result["index.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should work without logger (silent by default)", async () => {
      const { dir } = getTestResources("getBuildResult-no-logger");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["index.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("cleanup", () => {
    it("should not leave temporary directories", async () => {
      const { dir } = getTestResources("getBuildResult-cleanup");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        await getBuildResult(srcDir);

        const parentDir = join(srcDir, "..");
        const files = Bun.spawnSync(["ls", "-la", parentDir]).stdout.toString();
        expect(files).not.toContain(".tktmp_");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("component substitution", () => {
    it("should process .com.html components", async () => {
      const { dir } = getTestResources("getBuildResult-com-html");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body><my-component></my-component></body></html>",
        );
        writeFileSync(
          join(srcDir, "my-component.com.html"),
          '<div id="replaced">Component Replaced</div>',
        );

        const result = await getBuildResult(srcDir);
        const dom = result["index.html"]!.dom!;

        expect(dom.getElementById("replaced")).toBeDefined();
        expect(dom.getElementById("replaced")!.innerHTML).toBe(
          "Component Replaced",
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should process .pre.ts files", async () => {
      const { dir } = getTestResources("getBuildResult-pre-ts");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          '<!DOCTYPE html><html><head></head><body><div id="placeholder">original</div></body></html>',
        );
        writeFileSync(
          join(srcDir, "index.pre.ts"),
          `const el = document.getElementById("placeholder");
if (el) el.innerHTML = "Pre Generated";`,
        );

        const result = await getBuildResult(srcDir);
        const dom = result["index.html"]!.dom!;

        expect(dom.getElementById("placeholder")).toBeDefined();
        expect(dom.getElementById("placeholder")!.innerHTML).toBe(
          "Pre Generated",
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty project (only index.html)", async () => {
      const { dir } = getTestResources("getBuildResult-minimal");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);
        const keys = Object.keys(result);

        expect(keys.length).toBeGreaterThanOrEqual(1);
        expect(result["index.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should return Record indexed by path", async () => {
      const { dir } = getTestResources("getBuildResult-record-type");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(join(srcDir, "pages"), { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );
        writeFileSync(
          join(srcDir, "pages", "about.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(typeof result).toBe("object");
        expect(result["index.html"]).toBeDefined();
        expect(result["pages/about.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should handle files with special characters in name (HTML files keep names)", async () => {
      const { dir } = getTestResources("getBuildResult-special-chars");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(join(srcDir, "pages"), { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );
        writeFileSync(
          join(srcDir, "pages", "my-page_v2.html"),
          "<!DOCTYPE html><html><head></head><body></body></html>",
        );

        const result = await getBuildResult(srcDir);

        expect(result["pages/my-page_v2.html"]).toBeDefined();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should produce consistent hash for same content", async () => {
      const { dir } = getTestResources("getBuildResult-hash-consistent");
      const srcDir = join(dir, "websrc");
      const content =
        "<!DOCTYPE html><html><head></head><body>Same Content</body></html>";

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(join(srcDir, "index.html"), content);

        const result1 = await getBuildResult(srcDir);
        const result2 = await getBuildResult(srcDir);

        expect(result1["index.html"]!.fileHash).toBe(
          result2["index.html"]!.fileHash,
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should produce different hash for different content", async () => {
      const { dir } = getTestResources("getBuildResult-hash-different");
      const srcDir = join(dir, "websrc");

      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body>Content A</body></html>",
        );
        const result1 = await getBuildResult(srcDir);
        const hash1 = result1["index.html"]!.fileHash;

        writeFileSync(
          join(srcDir, "index.html"),
          "<!DOCTYPE html><html><head></head><body>Content B</body></html>",
        );
        const result2 = await getBuildResult(srcDir);
        const hash2 = result2["index.html"]!.fileHash;

        expect(hash1).not.toBe(hash2);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });
});
