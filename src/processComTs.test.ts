import { describe, it, expect, afterAll, beforeEach } from "bun:test";
import { processComTs } from "./processComTs";
import { rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("processComTs - TypeScript component substitution", () => {
  const TEST_DIR = join(tmpdir(), `tkeron-comts-test-${Date.now()}`);

  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("Basic .com.ts substitution", () => {
    it("should replace custom element with .com.ts generated content", async () => {
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

      const componentTs = `com.innerHTML = \`
<h1>My comp title</h1>
<img src="path/to/image.jpg" alt="image description" />
<div>My comp text content....</div>
\`;`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "my-component1.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<h1>My comp title</h1>");
      expect(result).toContain('<img src="path/to/image.jpg" alt="image description"');
      expect(result).toContain("<div>My comp text content....</div>");
      expect(result).not.toContain("<my-component1>");
    });

    it("should handle simple text content", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <greeting-comp></greeting-comp>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<h1>Hello World!</h1>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "greeting-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<h1>Hello World!</h1>");
      expect(result).not.toContain("<greeting-comp>");
    });

    it("should replace multiple instances of the same component", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp></my-comp>
  <p>Some text</p>
  <my-comp></my-comp>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<div class='item'>Item</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "my-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      const matches = result.match(/<div class="item">Item<\/div>/g);
      expect(matches).toBeTruthy();
      expect(matches?.length).toBe(2);
      expect(result).not.toContain("<my-comp>");
    });
  });

  describe("Component with access to com element", () => {
    it("should provide access to original element attributes", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <data-comp data-name="John" data-age="30"></data-comp>
</body>
</html>`;

      const componentTs = `
const name = com.getAttribute("data-name");
const age = com.getAttribute("data-age");
com.innerHTML = \`<p>Name: \${name}, Age: \${age}</p>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "data-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<p>Name: John, Age: 30</p>");
      expect(result).not.toContain("<data-comp>");
    });

    it("should allow reading element's inner content", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <wrapper-comp>Original content</wrapper-comp>
</body>
</html>`;

      const componentTs = `
const original = com.innerHTML;
com.innerHTML = \`<div class="wrapped">\${original}</div>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "wrapper-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain('<div class="wrapped">Original content</div>');
      expect(result).not.toContain("<wrapper-comp>");
    });

    it("should allow querying children of the element", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <list-comp>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </list-comp>
</body>
</html>`;

      const componentTs = `
const items = com.querySelectorAll("li");
const count = items.length;
com.innerHTML = \`<div>Found \${count} items</div>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "list-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Found 3 items</div>");
      expect(result).not.toContain("<list-comp>");
    });
  });

  describe("Dynamic content generation", () => {
    it("should allow conditional logic", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <conditional-comp data-show="true"></conditional-comp>
  <conditional-comp data-show="false"></conditional-comp>
</body>
</html>`;

      const componentTs = `
const show = com.getAttribute("data-show") === "true";
com.innerHTML = show ? "<div>Visible</div>" : "<div>Hidden</div>";
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "conditional-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Visible</div>");
      expect(result).toContain("<div>Hidden</div>");
      expect(result).not.toContain("<conditional-comp>");
    });

    it("should allow loops and array operations", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <list-gen-comp></list-gen-comp>
</body>
</html>`;

      const componentTs = `
const items = ["Apple", "Banana", "Cherry"];
const listItems = items.map(item => \`<li>\${item}</li>\`).join("");
com.innerHTML = \`<ul>\${listItems}</ul>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "list-gen-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>");
      expect(result).not.toContain("<list-gen-comp>");
    });

    it("should support complex TypeScript logic", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <calc-comp data-a="5" data-b="3"></calc-comp>
</body>
</html>`;

      const componentTs = `
const a = parseInt(com.getAttribute("data-a") || "0");
const b = parseInt(com.getAttribute("data-b") || "0");

function calculate(x: number, y: number): number {
  return x * y + (x + y);
}

const result = calculate(a, b);
com.innerHTML = \`<div>Result: \${result}</div>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "calc-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      // 5 * 3 + (5 + 3) = 15 + 8 = 23
      expect(result).toContain("<div>Result: 23</div>");
      expect(result).not.toContain("<calc-comp>");
    });
  });

  describe("Multiple .com.ts files", () => {
    it("should process all .com.ts components in a single HTML", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <header-ts></header-ts>
  <content-ts></content-ts>
  <footer-ts></footer-ts>
</body>
</html>`;

      const headerTs = `com.innerHTML = "<header>Header TS</header>";`;
      const contentTs = `com.innerHTML = "<main>Content TS</main>";`;
      const footerTs = `com.innerHTML = "<footer>Footer TS</footer>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "header-ts.com.ts"), headerTs);
      writeFileSync(join(TEST_DIR, "content-ts.com.ts"), contentTs);
      writeFileSync(join(TEST_DIR, "footer-ts.com.ts"), footerTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<header>Header TS</header>");
      expect(result).toContain("<main>Content TS</main>");
      expect(result).toContain("<footer>Footer TS</footer>");
      expect(result).not.toContain("<header-ts>");
      expect(result).not.toContain("<content-ts>");
      expect(result).not.toContain("<footer-ts>");
    });

    it("should process components across multiple HTML files", async () => {
      mkdirSync(join(TEST_DIR, "section"), { recursive: true });

      const index1Html = `<!DOCTYPE html>
<html>
<body>
  <shared-ts-comp></shared-ts-comp>
</body>
</html>`;

      const index2Html = `<!DOCTYPE html>
<html>
<body>
  <shared-ts-comp></shared-ts-comp>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<div>Shared TS</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), index1Html);
      writeFileSync(join(TEST_DIR, "section", "page.html"), index2Html);
      writeFileSync(join(TEST_DIR, "shared-ts-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result1 = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      const result2 = readFileSync(join(TEST_DIR, "section", "page.html"), "utf-8");
      
      expect(result1).toContain("<div>Shared TS</div>");
      expect(result2).toContain("<div>Shared TS</div>");
      expect(result1).not.toContain("<shared-ts-comp>");
      expect(result2).not.toContain("<shared-ts-comp>");
    });
  });

  describe("Component location priority", () => {
    it("should find components in the same directory as HTML", async () => {
      mkdirSync(join(TEST_DIR, "section"), { recursive: true });

      const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <local-ts-comp></local-ts-comp>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<div>Local TS</div>";`;

      writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
      writeFileSync(join(TEST_DIR, "section", "local-ts-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "section", "page.html"), "utf-8");
      
      expect(result).toContain("<div>Local TS</div>");
      expect(result).not.toContain("<local-ts-comp>");
    });

    it("should prioritize local .com.ts over root .com.ts", async () => {
      mkdirSync(join(TEST_DIR, "section"), { recursive: true });

      const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <priority-comp></priority-comp>
</body>
</html>`;

      const rootTs = `com.innerHTML = "<div>Root TS</div>";`;
      const localTs = `com.innerHTML = "<div>Local TS</div>";`;

      writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
      writeFileSync(join(TEST_DIR, "priority-comp.com.ts"), rootTs);
      writeFileSync(join(TEST_DIR, "section", "priority-comp.com.ts"), localTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "section", "page.html"), "utf-8");
      
      expect(result).toContain("<div>Local TS</div>");
      expect(result).not.toContain("<div>Root TS</div>");
      expect(result).not.toContain("<priority-comp>");
    });

    it("should fall back to root if local not found", async () => {
      mkdirSync(join(TEST_DIR, "section"), { recursive: true });

      const sectionHtml = `<!DOCTYPE html>
<html>
<body>
  <root-only-comp></root-only-comp>
</body>
</html>`;

      const rootTs = `com.innerHTML = "<div>From Root</div>";`;

      writeFileSync(join(TEST_DIR, "section", "page.html"), sectionHtml);
      writeFileSync(join(TEST_DIR, "root-only-comp.com.ts"), rootTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "section", "page.html"), "utf-8");
      
      expect(result).toContain("<div>From Root</div>");
      expect(result).not.toContain("<root-only-comp>");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty innerHTML assignment", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <empty-comp></empty-comp>
</body>
</html>`;

      const componentTs = `com.innerHTML = "";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "empty-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).not.toContain("<empty-comp>");
    });

    it("should handle component with no innerHTML modification", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <no-op-comp>Original</no-op-comp>
</body>
</html>`;

      const componentTs = `// Do nothing, don't modify com.innerHTML`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "no-op-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      // Should keep original content since innerHTML wasn't modified
      expect(result).toContain("Original");
    });

    it("should handle self-closing tags", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <self-close-comp />
</body>
</html>`;

      const componentTs = `com.innerHTML = "<div>Self-closed replaced</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "self-close-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Self-closed replaced</div>");
      expect(result).not.toContain("<self-close-comp");
    });

    it("should handle components with special characters in names", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <my-comp-v2-final></my-comp-v2-final>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<div>Special name</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "my-comp-v2-final.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Special name</div>");
      expect(result).not.toContain("<my-comp-v2-final>");
    });

    it("should preserve HTML structure around components", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div class="wrapper">
    <ts-comp></ts-comp>
  </div>
</body>
</html>`;

      const componentTs = `com.innerHTML = "<p>Inside wrapper</p>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "ts-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain('<div class="wrapper">');
      expect(result).toContain("<p>Inside wrapper</p>");
      expect(result).toContain("</div>");
      expect(result).toContain("<title>Test</title>");
    });
  });

  describe("Component not found", () => {
    it("should leave element unchanged if no .com.ts found", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <unknown-ts-comp></unknown-ts-comp>
</body>
</html>`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<unknown-ts-comp></unknown-ts-comp>");
    });

    it("should process found components and leave unfound ones", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <found-ts></found-ts>
  <not-found-ts></not-found-ts>
</body>
</html>`;

      const foundTs = `com.innerHTML = "<div>Found</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "found-ts.com.ts"), foundTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Found</div>");
      expect(result).not.toContain("<found-ts>");
      expect(result).toContain("<not-found-ts></not-found-ts>");
    });
  });

  describe("Error handling", () => {
    it("should handle TypeScript syntax errors gracefully", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <error-comp></error-comp>
</body>
</html>`;

      const componentTs = `
// Invalid TypeScript
const x = ;
com.innerHTML = "<div>Error</div>";
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "error-comp.com.ts"), componentTs);

      // Should throw or handle error
      await expect(processComTs(TEST_DIR)).rejects.toThrow();
    });

    it("should handle runtime errors in component code", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <runtime-error-comp></runtime-error-comp>
</body>
</html>`;

      const componentTs = `
throw new Error("Runtime error in component");
com.innerHTML = "<div>Should not reach here</div>";
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "runtime-error-comp.com.ts"), componentTs);

      // Should throw error
      await expect(processComTs(TEST_DIR)).rejects.toThrow();
    });
  });

  describe("Integration with imports", () => {
    it("should allow importing external modules", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <import-comp></import-comp>
</body>
</html>`;

      const componentTs = `
import { join } from "path";
const result = join("test", "path");
com.innerHTML = \`<div>Path: \${result}</div>\`;
`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "import-comp.com.ts"), componentTs);

      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      expect(result).toContain("<div>Path: test");
      expect(result).not.toContain("<import-comp>");
    });
  });

  describe("Performance", () => {
    it("should handle multiple components efficiently", async () => {
      const components = Array.from({ length: 30 }, (_, i) => `ts-comp-${i}`);
      
      let indexHtml = `<!DOCTYPE html>
<html>
<body>
`;
      
      for (const comp of components) {
        indexHtml += `  <${comp}></${comp}>\n`;
        writeFileSync(
          join(TEST_DIR, `${comp}.com.ts`), 
          `com.innerHTML = "<div class=\\"${comp}\\">TS Content ${comp}</div>";`
        );
      }
      
      indexHtml += `</body>
</html>`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);

      const startTime = performance.now();
      await processComTs(TEST_DIR);
      const duration = performance.now() - startTime;

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      for (const comp of components) {
        expect(result).toContain(`<div class="${comp}">TS Content ${comp}</div>`);
        expect(result).not.toContain(`<${comp}>`);
      }

      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe(".com.ts vs .com.html priority", () => {
    it("should use .com.ts over .com.html when both exist", async () => {
      const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <both-comp></both-comp>
</body>
</html>`;

      const htmlComponent = `<div>From HTML</div>`;
      const tsComponent = `com.innerHTML = "<div>From TS</div>";`;

      writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
      writeFileSync(join(TEST_DIR, "both-comp.com.html"), htmlComponent);
      writeFileSync(join(TEST_DIR, "both-comp.com.ts"), tsComponent);

      // This test follows the actual build flow: .com.ts is processed first, then .com.html
      // First process .com.ts (higher priority)
      await processComTs(TEST_DIR);

      // Then process .com.html (fallback for components without .com.ts)
      const { processCom } = await import("./processCom");
      await processCom(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      // Should have TS version, not HTML version
      expect(result).toContain("<div>From TS</div>");
      expect(result).not.toContain("<div>From HTML</div>");
      expect(result).not.toContain("<both-comp>");
    });
  });
});
