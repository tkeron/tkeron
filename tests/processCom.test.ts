import { describe, it, expect } from "bun:test";
import { processCom } from "../src/processCom";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources, createTestLogger } from "./test-helpers";

describe("processCom - Component substitution", () => {
  describe("Basic .com.html substitution", () => {
    it("should replace custom element with .com.html content", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-replace-custom-element-with-com-html-content",
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
  <my-component1></my-component1>
</body>
</html>`;

        const componentHtml = `<h1>My comp title</h1>
<img src="path/to/image.jpg" alt="image description" />
<div>My comp text content....</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-component1.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<h1>My comp title</h1>");
        expect(result).toContain(
          '<img src="path/to/image.jpg" alt="image description"',
        );
        expect(result).toContain("<div>My comp text content....</div>");
        expect(result).not.toContain("<my-component1>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should replace component with wrapped content", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-replace-component-with-wrapped-content",
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
  <my-component1></my-component1>
</body>
</html>`;

        const componentHtml = `<div class="my-comp-class">
  <h1>My comp title</h1>
  <img src="path/to/image.jpg" alt="image description" />
  <div>My comp text content....</div>
</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-component1.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain('<div class="my-comp-class">');
        expect(result).toContain("<h1>My comp title</h1>");
        expect(result).not.toContain("<my-component1>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle multiple instances of the same component", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-multiple-instances-of-the-same-component",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-component1></my-component1>
  <p>Some text</p>
  <my-component1></my-component1>
</body>
</html>`;

        const componentHtml = `<div class="comp">Content</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-component1.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Should have 2 instances of the component content
        const matches = result.match(/<div class="comp">Content<\/div>/g);
        expect(matches).toBeTruthy();
        expect(matches?.length).toBe(2);
        expect(result).not.toContain("<my-component1>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle multiple different components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-multiple-different-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <header-comp></header-comp>
  <main-comp></main-comp>
  <footer-comp></footer-comp>
</body>
</html>`;

        const headerHtml = `<header><h1>Header</h1></header>`;
        const mainHtml = `<main><p>Main content</p></main>`;
        const footerHtml = `<footer><p>Footer</p></footer>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "header-comp.com.html"), headerHtml);
        writeFileSync(join(TEST_DIR, "main-comp.com.html"), mainHtml);
        writeFileSync(join(TEST_DIR, "footer-comp.com.html"), footerHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<header><h1>Header</h1></header>");
        expect(result).toContain("<main><p>Main content</p></main>");
        expect(result).toContain("<footer><p>Footer</p></footer>");
        expect(result).not.toContain("<header-comp>");
        expect(result).not.toContain("<main-comp>");
        expect(result).not.toContain("<footer-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component with attributes", () => {
    it("should replace self-closing component tags", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-replace-self-closing-component-tags",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-component1 />
</body>
</html>`;

        const componentHtml = `<div>Component content</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-component1.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<div>Component content</div>");
        expect(result).not.toContain("<my-component1");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should ignore component attributes during substitution", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-ignore-component-attributes-during-substitution",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-component1 class="custom-class" id="my-id"></my-component1>
</body>
</html>`;

        const componentHtml = `<div class="comp-class">Component</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-component1.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Component's own classes should be there, not the original element's
        expect(result).toContain('<div class="comp-class">Component</div>');
        expect(result).not.toContain("custom-class");
        expect(result).not.toContain("my-id");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Nested components", () => {
    it("should handle components inside other components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-components-inside-other-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <outer-comp></outer-comp>
</body>
</html>`;

        const outerHtml = `<div class="outer">
  <h1>Outer</h1>
  <inner-comp></inner-comp>
</div>`;

        const innerHtml = `<div class="inner">Inner content</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "outer-comp.com.html"), outerHtml);
        writeFileSync(join(TEST_DIR, "inner-comp.com.html"), innerHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain('<div class="outer">');
        expect(result).toContain('<div class="inner">Inner content</div>');
        expect(result).not.toContain("<outer-comp>");
        expect(result).not.toContain("<inner-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component not found", () => {
    it("should leave element unchanged if no .com.html found", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-leave-element-unchanged-if-no-com-html-found",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <unknown-component></unknown-component>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Should remain unchanged
        expect(result).toContain("<unknown-component></unknown-component>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle mix of found and not-found components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-mix-of-found-and-not-found-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <found-comp></found-comp>
  <not-found-comp></not-found-comp>
</body>
</html>`;

        const foundHtml = `<div>Found</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "found-comp.com.html"), foundHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<div>Found</div>");
        expect(result).not.toContain("<found-comp>");
        expect(result).toContain("<not-found-comp></not-found-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Multiple HTML files", () => {
    it("should process components in all HTML files", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-process-components-in-all-html-files",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        mkdirSync(join(TEST_DIR, "section"), { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp></my-comp>
</body>
</html>`;

        const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp></my-comp>
</body>
</html>`;

        const componentHtml = `<div class="comp">Shared component</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
        writeFileSync(join(TEST_DIR, "my-comp.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const indexResult = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        const sectionResult = readFileSync(
          join(TEST_DIR, "section", "page.html"),
          "utf-8",
        );

        expect(indexResult).toContain(
          '<div class="comp">Shared component</div>',
        );
        expect(sectionResult).toContain(
          '<div class="comp">Shared component</div>',
        );
        expect(indexResult).not.toContain("<my-comp>");
        expect(sectionResult).not.toContain("<my-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component in subdirectories", () => {
    it("should find components in the same directory as HTML", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-find-components-in-the-same-directory-as-html",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        mkdirSync(join(TEST_DIR, "section"), { recursive: true });

        const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <local-comp></local-comp>
</body>
</html>`;

        const componentHtml = `<div>Local component</div>`;

        writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
        writeFileSync(
          join(TEST_DIR, "section", "local-comp.com.html"),
          componentHtml,
        );

        await processCom(TEST_DIR);

        const result = readFileSync(
          join(TEST_DIR, "section", "page.html"),
          "utf-8",
        );

        expect(result).toContain("<div>Local component</div>");
        expect(result).not.toContain("<local-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should prioritize local components over root components", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-prioritize-local-components-over-root-components",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        mkdirSync(join(TEST_DIR, "section"), { recursive: true });

        const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <shared-comp></shared-comp>
</body>
</html>`;

        const rootComponentHtml = `<div>Root component</div>`;
        const localComponentHtml = `<div>Local component</div>`;

        writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
        writeFileSync(
          join(TEST_DIR, "shared-comp.com.html"),
          rootComponentHtml,
        );
        writeFileSync(
          join(TEST_DIR, "section", "shared-comp.com.html"),
          localComponentHtml,
        );

        await processCom(TEST_DIR);

        const result = readFileSync(
          join(TEST_DIR, "section", "page.html"),
          "utf-8",
        );

        // Should use local component, not root
        expect(result).toContain("<div>Local component</div>");
        expect(result).not.toContain("<div>Root component</div>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty component files", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-empty-component-files",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp></my-comp>
</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-comp.com.html"), "");

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Should replace with empty content
        expect(result).not.toContain("<my-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle components with inner content (should be ignored)", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-components-with-inner-content-should-be-ignored",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp>
    <p>This inner content should be replaced</p>
  </my-comp>
</body>
</html>`;

        const componentHtml = `<div>Component replaces everything</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-comp.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<div>Component replaces everything</div>");
        expect(result).not.toContain("This inner content should be replaced");
        expect(result).not.toContain("<my-comp>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should preserve HTML structure and indentation context", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-preserve-html-structure-and-indentation-context",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <my-comp></my-comp>
  </div>
</body>
</html>`;

        const componentHtml = `<div class="component">Content</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-comp.com.html"), componentHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain('<div class="container">');
        expect(result).toContain('<div class="component">Content</div>');
        expect(result).toContain("</body>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle component names with numbers and dashes", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-component-names-with-numbers-and-dashes",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp-123></my-comp-123>
  <comp-v2></comp-v2>
</body>
</html>`;

        const comp123Html = `<div>Component 123</div>`;
        const compV2Html = `<div>Component V2</div>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "my-comp-123.com.html"), comp123Html);
        writeFileSync(join(TEST_DIR, "comp-v2.com.html"), compV2Html);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain("<div>Component 123</div>");
        expect(result).toContain("<div>Component V2</div>");
        expect(result).not.toContain("<my-comp-123>");
        expect(result).not.toContain("<comp-v2>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Performance and scalability", () => {
    it("should handle many components efficiently", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-handle-many-components-efficiently",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        const components = Array.from({ length: 50 }, (_, i) => `comp-${i}`);

        let indexHtml = `<!DOCTYPE html>
<html>
<body>
`;

        for (const comp of components) {
          indexHtml += `  <${comp}></${comp}>\n`;
          writeFileSync(
            join(TEST_DIR, `${comp}.com.html`),
            `<div class="${comp}">Content ${comp}</div>`,
          );
        }

        indexHtml += `</body>
</html>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);

        const startTime = performance.now();
        await processCom(TEST_DIR);
        const duration = performance.now() - startTime;

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Verify all components were replaced
        for (const comp of components) {
          expect(result).toContain(
            `<div class="${comp}">Content ${comp}</div>`,
          );
          expect(result).not.toContain(`<${comp}>`);
        }

        // Should complete in reasonable time (< 1 second for 50 components)
        expect(duration).toBeLessThan(1000);
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Circular dependency detection", () => {
    it("should throw error on 2-component circular dependency", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-throw-error-on-2-component-circular-dependency",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(join(TEST_DIR, "index.html"), "<comp-a></comp-a>");
        writeFileSync(
          join(TEST_DIR, "comp-a.com.html"),
          "<div><comp-b></comp-b></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-b.com.html"),
          "<div><comp-a></comp-a></div>",
        );

        await expect(processCom(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should throw error on 3-component circular dependency", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-throw-error-on-3-component-circular-dependency",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(join(TEST_DIR, "index.html"), "<comp-x></comp-x>");
        writeFileSync(
          join(TEST_DIR, "comp-x.com.html"),
          "<div><comp-y></comp-y></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-y.com.html"),
          "<div><comp-z></comp-z></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-z.com.html"),
          "<div><comp-x></comp-x></div>",
        );

        await expect(processCom(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should throw error on 4-component circular dependency", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-throw-error-on-4-component-circular-dependency",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          "<comp-alpha></comp-alpha>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-alpha.com.html"),
          "<div><comp-beta></comp-beta></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-beta.com.html"),
          "<div><comp-gamma></comp-gamma></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-gamma.com.html"),
          "<div><comp-delta></comp-delta></div>",
        );
        writeFileSync(
          join(TEST_DIR, "comp-delta.com.html"),
          "<div><comp-alpha></comp-alpha></div>",
        );

        await expect(processCom(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should throw error on self-referencing component", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-throw-error-on-self-referencing-component",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });
        writeFileSync(
          join(TEST_DIR, "index.html"),
          "<recursive-comp></recursive-comp>",
        );
        writeFileSync(
          join(TEST_DIR, "recursive-comp.com.html"),
          "<div><recursive-comp></recursive-comp></div>",
        );

        await expect(processCom(TEST_DIR)).rejects.toThrow();
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Deep nesting MAX_DEPTH", () => {
    it("should warn when exceeding MAX_DEPTH of 50", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-max-depth-warning",
      );
      const testLogger = createTestLogger();

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        // Create deeply nested HTML
        let html = `<!DOCTYPE html><html><body>`;
        for (let i = 0; i < 52; i++) {
          html += `<nest-${i}>`;
        }
        for (let i = 51; i >= 0; i--) {
          html += `</nest-${i}>`;
        }
        html += `</body></html>`;

        writeFileSync(join(TEST_DIR, "index.html"), html);

        // Create components that nest into each other
        for (let i = 0; i < 52; i++) {
          const next = i < 51 ? `<nest-${i + 1}></nest-${i + 1}>` : "End";
          writeFileSync(
            join(TEST_DIR, `nest-${i}.com.html`),
            `<div>${next}</div>`,
          );
        }

        await processCom(TEST_DIR, { logger: testLogger.logger });

        expect(testLogger.warns.length).toBeGreaterThan(0);
        expect(
          testLogger.warns.some((w) =>
            w.includes("Maximum component nesting depth"),
          ),
        ).toBe(true);
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component substitution in <head>", () => {
    it("should replace custom elements in <head> section", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-replace-components-in-head",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
  <meta-tags></meta-tags>
</head>
<body>
  <h1>Body content</h1>
</body>
</html>`;

        const metaTagsHtml = `<meta name="description" content="Test description">
<meta name="keywords" content="test, keywords">
<meta property="og:title" content="Test Title">`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "meta-tags.com.html"), metaTagsHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        expect(result).toContain(
          '<meta name="description" content="Test description">',
        );
        expect(result).toContain(
          '<meta name="keywords" content="test, keywords">',
        );
        expect(result).toContain(
          '<meta property="og:title" content="Test Title">',
        );
        expect(result).not.toContain("<meta-tags>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should replace custom elements in both <head> and <body>", async () => {
      const { dir: TEST_DIR } = getTestResources(
        "processCom-should-replace-in-head-and-body",
      );

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
  <social-meta></social-meta>
</head>
<body>
  <page-header></page-header>
  <p>Main content</p>
</body>
</html>`;

        const socialMetaHtml = `<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page Description">`;

        const pageHeaderHtml = `<header>
  <h1>Welcome</h1>
  <nav>Navigation</nav>
</header>`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "social-meta.com.html"), socialMetaHtml);
        writeFileSync(join(TEST_DIR, "page-header.com.html"), pageHeaderHtml);

        await processCom(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");

        // Check head components
        expect(result).toContain(
          '<meta property="og:title" content="Page Title">',
        );
        expect(result).toContain(
          '<meta property="og:description" content="Page Description">',
        );
        expect(result).not.toContain("<social-meta>");

        // Check body components
        expect(result).toContain("<header>");
        expect(result).toContain("<h1>Welcome</h1>");
        expect(result).toContain("<nav>Navigation</nav>");
        expect(result).not.toContain("<page-header>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Input validation", () => {
    it("should return false and log error when tempDir is invalid", async () => {
      const { logger, errors } = createTestLogger();

      // Test with empty string
      const result1 = await processCom("", { logger });
      expect(result1).toBe(false);
      expect(errors.some((e) => e.includes("Invalid tempDir"))).toBe(true);

      // Test with null-ish value
      const result2 = await processCom(null as any, { logger });
      expect(result2).toBe(false);
    });
  });
});
