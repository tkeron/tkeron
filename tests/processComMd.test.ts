import { describe, it, expect } from "bun:test";
import { processComMd } from "../src/processComMd";
import { parseHTML } from "@tkeron/html-parser";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources, createTestLogger } from "./test-helpers";

describe("processComMd - Markdown component substitution", () => {
  describe("Basic .com.md substitution", () => {
    it("should replace custom element with markdown-rendered HTML", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-replace-custom-element-with-md-html",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
</head>
<body>
  <my-section></my-section>
</body>
</html>`;

        const componentMd = `# Hello World`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-section.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const h1 = doc.querySelector("h1");

        expect(h1).toBeTruthy();
        expect(h1!.textContent).toBe("Hello World");
        expect(result).not.toContain("<my-section>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render bold text from markdown", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-bold-text",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-text></my-text>
</body>
</html>`;

        const componentMd = `This is **bold** text`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-text.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const strong = doc.querySelector("strong");

        expect(strong).toBeTruthy();
        expect(strong!.textContent).toBe("bold");
        expect(result).not.toContain("<my-text>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render unordered list from markdown", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-unordered-list",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-list></my-list>
</body>
</html>`;

        const componentMd = `- Apple\n- Banana\n- Cherry`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-list.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const ul = doc.querySelector("ul");
        const items = doc.querySelectorAll("li");

        expect(ul).toBeTruthy();
        expect(items.length).toBe(3);
        expect(items[0]!.textContent).toBe("Apple");
        expect(items[2]!.textContent).toBe("Cherry");
        expect(result).not.toContain("<my-list>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render links from markdown", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-links",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-link></my-link>
</body>
</html>`;

        const componentMd = `[Visit site](https://example.com)`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-link.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const a = doc.querySelector("a");

        expect(a).toBeTruthy();
        expect(a!.textContent).toBe("Visit site");
        expect(a!.getAttribute("href")).toBe("https://example.com");
        expect(result).not.toContain("<my-link>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render GFM table from markdown", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-gfm-table",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-table></my-table>
</body>
</html>`;

        const componentMd = `| Name | Age |\n|------|-----|\n| Alice | 30 |`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-table.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const table = doc.querySelector("table");
        const th = doc.querySelector("th");
        const td = doc.querySelector("td");

        expect(table).toBeTruthy();
        expect(th).toBeTruthy();
        expect(th!.textContent).toBe("Name");
        expect(td).toBeTruthy();
        expect(result).not.toContain("<my-table>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render mixed markdown content", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-mixed-content",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-content></my-content>
</body>
</html>`;

        const componentMd = `# Title\n\nSome **bold** paragraph\n\n- list item`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-content.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);

        expect(doc.querySelector("h1")).toBeTruthy();
        expect(doc.querySelector("h1")!.textContent).toBe("Title");
        expect(doc.querySelector("strong")).toBeTruthy();
        expect(doc.querySelector("strong")!.textContent).toBe("bold");
        expect(doc.querySelector("ul")).toBeTruthy();
        expect(doc.querySelector("li")).toBeTruthy();
        expect(doc.querySelector("li")!.textContent).toBe("list item");
        expect(result).not.toContain("<my-content>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Multiple instances and components", () => {
    it("should handle multiple instances of the same component", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-handle-multiple-instances",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-badge></my-badge>
  <p>separator</p>
  <my-badge></my-badge>
</body>
</html>`;

        const componentMd = `**Featured**`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-badge.com.md"), componentMd);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const strongs = doc.querySelectorAll("strong");

        expect(strongs.length).toBe(2);
        expect(result).not.toContain("<my-badge>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle multiple different markdown components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-handle-multiple-different-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <header-md></header-md>
  <footer-md></footer-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "header-md.com.md"), `# Header`);
        writeFileSync(join(TEST_DIR, "footer-md.com.md"), `*Footer text*`);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);

        expect(doc.querySelector("h1")).toBeTruthy();
        expect(doc.querySelector("h1")!.textContent).toBe("Header");
        expect(doc.querySelector("em")).toBeTruthy();
        expect(doc.querySelector("em")!.textContent).toBe("Footer text");
        expect(result).not.toContain("<header-md>");
        expect(result).not.toContain("<footer-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component resolution", () => {
    it("should find component in same directory as HTML", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-find-in-same-directory",
      );

      try {
        mkdirSync(join(TEST_DIR, "section"), { recursive: true });

        const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <local-md></local-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
        writeFileSync(join(TEST_DIR, "section", "local-md.com.md"), `## Local`);

        await processComMd(TEST_DIR);

        const result = readFileSync(
          join(TEST_DIR, "section", "page.html"),
          "utf-8",
        );
        const doc = parseHTML(result);

        expect(doc.querySelector("h2")).toBeTruthy();
        expect(doc.querySelector("h2")!.textContent).toBe("Local");
        expect(result).not.toContain("<local-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should fallback to root directory for component", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-fallback-to-root",
      );

      try {
        mkdirSync(join(TEST_DIR, "section"), { recursive: true });

        const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <root-md></root-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
        writeFileSync(join(TEST_DIR, "root-md.com.md"), `### From Root`);

        await processComMd(TEST_DIR);

        const result = readFileSync(
          join(TEST_DIR, "section", "page.html"),
          "utf-8",
        );
        const doc = parseHTML(result);

        expect(doc.querySelector("h3")).toBeTruthy();
        expect(doc.querySelector("h3")!.textContent).toBe("From Root");
        expect(result).not.toContain("<root-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should process components in all HTML files", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-process-all-html-files",
      );

      try {
        mkdirSync(join(TEST_DIR, "sub"), { recursive: true });

        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><shared-md></shared-md></body></html>`,
        );
        writeFileSync(
          join(TEST_DIR, "sub", "page.html"),
          `<!DOCTYPE html><html><body><shared-md></shared-md></body></html>`,
        );
        writeFileSync(join(TEST_DIR, "shared-md.com.md"), `**Shared**`);

        await processComMd(TEST_DIR);

        const idx = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const sub = readFileSync(join(TEST_DIR, "sub", "page.html"), "utf-8");
        const docIdx = parseHTML(idx);
        const docSub = parseHTML(sub);

        expect(docIdx.querySelector("strong")).toBeTruthy();
        expect(docSub.querySelector("strong")).toBeTruthy();
        expect(idx).not.toContain("<shared-md>");
        expect(sub).not.toContain("<shared-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component not found", () => {
    it("should leave element unchanged if no .com.md found", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-leave-unchanged-if-no-com-md",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <unknown-md></unknown-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);

        const changed = await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(changed).toBe(false);
        expect(result).toContain("<unknown-md></unknown-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle mix of found and not-found md components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-handle-mix-found-not-found",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <found-md></found-md>
  <missing-md></missing-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "found-md.com.md"), `## Found`);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);

        expect(doc.querySelector("h2")).toBeTruthy();
        expect(doc.querySelector("h2")!.textContent).toBe("Found");
        expect(result).not.toContain("<found-md>");
        expect(result).toContain("<missing-md></missing-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Nested markdown components", () => {
    it("should handle md components inside other md components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-nested-md-inside-md",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <outer-md></outer-md>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(
          join(TEST_DIR, "outer-md.com.md"),
          `# Outer\n\n<inner-md></inner-md>`,
        );
        writeFileSync(join(TEST_DIR, "inner-md.com.md"), `**Inner**`);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);

        expect(doc.querySelector("h1")).toBeTruthy();
        expect(doc.querySelector("h1")!.textContent).toBe("Outer");
        expect(doc.querySelector("strong")).toBeTruthy();
        expect(doc.querySelector("strong")!.textContent).toBe("Inner");
        expect(result).not.toContain("<outer-md>");
        expect(result).not.toContain("<inner-md>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Circular dependency detection", () => {
    it("should throw error on 2-component circular dependency", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-circular-2-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(join(TEST_DIR, "index.html"), "<comp-aa></comp-aa>");
        writeFileSync(
          join(TEST_DIR, "comp-aa.com.md"),
          `# A\n\n<comp-bb></comp-bb>`,
        );
        writeFileSync(
          join(TEST_DIR, "comp-bb.com.md"),
          `# B\n\n<comp-aa></comp-aa>`,
        );

        await expect(processComMd(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should throw error on 3-component circular dependency", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-circular-3-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(join(TEST_DIR, "index.html"), "<comp-xx></comp-xx>");
        writeFileSync(join(TEST_DIR, "comp-xx.com.md"), `<comp-yy></comp-yy>`);
        writeFileSync(join(TEST_DIR, "comp-yy.com.md"), `<comp-zz></comp-zz>`);
        writeFileSync(join(TEST_DIR, "comp-zz.com.md"), `<comp-xx></comp-xx>`);

        await expect(processComMd(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Return value", () => {
    it("should return true when components were substituted", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-return-true-when-changed",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><my-md></my-md></body></html>`,
        );
        writeFileSync(join(TEST_DIR, "my-md.com.md"), `# Changed`);

        const result = await processComMd(TEST_DIR);

        expect(result).toBe(true);
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should return false when no components were found", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-return-false-no-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><p>No components</p></body></html>`,
        );

        const result = await processComMd(TEST_DIR);

        expect(result).toBe(false);
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Input validation", () => {
    it("should return false and log error when tempDir is invalid", async () => {
      const { logger, errors } = createTestLogger();

      const result1 = await processComMd("", { logger });
      expect(result1).toBe(false);
      expect(errors.some((e) => e.includes("Invalid tempDir"))).toBe(true);

      const result2 = await processComMd(null as any, { logger });
      expect(result2).toBe(false);
    });
  });

  describe("Component naming validation", () => {
    it("should error on .com.md component without hyphen in name", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-error-without-hyphen",
      );
      const { logger } = createTestLogger();

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <greeting></greeting>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "greeting.com.md"), `# Hello`);

        await expect(processComMd(TEST_DIR, { logger })).rejects.toThrow(
          "Component name 'greeting' must contain at least one hyphen",
        );
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("GFM features", () => {
    it("should render strikethrough text", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-strikethrough",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><my-strike></my-strike></body></html>`,
        );
        writeFileSync(join(TEST_DIR, "my-strike.com.md"), `~~deleted~~`);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const del = doc.querySelector("del");

        expect(del).toBeTruthy();
        expect(del!.textContent).toBe("deleted");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render blockquote", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-blockquote",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><my-quote></my-quote></body></html>`,
        );
        writeFileSync(join(TEST_DIR, "my-quote.com.md"), `> A wise quote`);

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);
        const blockquote = doc.querySelector("blockquote");

        expect(blockquote).toBeTruthy();
        expect(blockquote!.textContent.trim()).toContain("A wise quote");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should render heading levels", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processComMd-should-render-heading-levels",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          `<!DOCTYPE html><html><body><my-headings></my-headings></body></html>`,
        );
        writeFileSync(
          join(TEST_DIR, "my-headings.com.md"),
          `# H1\n\n## H2\n\n### H3`,
        );

        await processComMd(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const doc = parseHTML(result);

        expect(doc.querySelector("h1")).toBeTruthy();
        expect(doc.querySelector("h1")!.textContent).toBe("H1");
        expect(doc.querySelector("h2")).toBeTruthy();
        expect(doc.querySelector("h2")!.textContent).toBe("H2");
        expect(doc.querySelector("h3")).toBeTruthy();
        expect(doc.querySelector("h3")!.textContent).toBe("H3");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });
});
