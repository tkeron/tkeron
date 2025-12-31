import { describe, it, expect, spyOn } from "bun:test";
import { processComTs } from "./processComTs";
import { rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources } from "./test-helpers";

describe("processComTs - TypeScript component substitution", () => {

  describe("Basic .com.ts substitution", () => {
    it("should replace custom element with .com.ts generated content", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-replace-custom-element-with-com-ts-generated-content");

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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle simple text content", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-simple-text-content");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should replace multiple instances of the same component", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-replace-multiple-instances-of-the-same-component");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component with access to com element", () => {
    it("should provide access to original element attributes", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-provide-access-to-original-element-attributes");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should allow reading element's inner content", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-allow-reading-element-s-inner-content");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should allow querying children of the element", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-allow-querying-children-of-the-element");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Dynamic content generation", () => {
    it("should allow conditional logic", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-allow-conditional-logic");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should allow loops and array operations", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-allow-loops-and-array-operations");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should support complex TypeScript logic", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-support-complex-typescript-logic");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Multiple .com.ts files", () => {
    it("should process all .com.ts components in a single HTML", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-process-all-com-ts-components-in-a-single-html");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should process components across multiple HTML files", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-process-components-across-multiple-html-files");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component location priority", () => {
    it("should find components in the same directory as HTML", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-find-components-in-the-same-directory-as-html");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should prioritize local .com.ts over root .com.ts", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-prioritize-local-com-ts-over-root-com-ts");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should fall back to root if local not found", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-fall-back-to-root-if-local-not-found");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty innerHTML assignment", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-empty-innerhtml-assignment");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle component with no innerHTML modification", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-component-with-no-innerhtml-modification");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle self-closing tags", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-self-closing-tags");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle components with special characters in names", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-components-with-special-characters-in-names");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should preserve HTML structure around components", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-preserve-html-structure-around-components");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Component not found", () => {
    it("should leave element unchanged if no .com.ts found", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-leave-element-unchanged-if-no-com-ts-found");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should process found components and leave unfound ones", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-process-found-components-and-leave-unfound-ones");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Error handling", () => {
    it("should handle TypeScript syntax errors gracefully", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-typescript-syntax-errors-gracefully");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle runtime errors in component code", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-runtime-errors-in-component-code");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Integration with imports", () => {
    it("should allow importing external modules", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-allow-importing-external-modules");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Performance", () => {
    it("should handle multiple components efficiently", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-multiple-components-efficiently");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe(".com.ts vs .com.html priority", () => {
    it("should show .com.html processes first, then .com.ts", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-com-html-processes-first");

      try {
        mkdirSync(TEST_DIR, { recursive: true });
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

      // This test follows the actual build flow: .com.html is processed first, then .com.ts
      // First process .com.html
      const { processCom } = await import("./processCom");
      await processCom(TEST_DIR);

      // Then process .com.ts (but component already replaced, so .com.ts won't find it)
      await processComTs(TEST_DIR);

      const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
      
      // Should have HTML version since it was processed first
      expect(result).toContain("<div>From HTML</div>");
      expect(result).not.toContain("<div>From TS</div>");
      expect(result).not.toContain("<both-comp>");
          } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Empty component content handling", () => {
    it("should handle component that produces empty content", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-empty-component-content");

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html>
<body>
  <p>Before</p>
  <empty-comp></empty-comp>
  <p>After</p>
</body>
</html>`;

        // Component that clears its content
        const tsComponent = `com.innerHTML = "";`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "empty-comp.com.ts"), tsComponent);

        await processComTs(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        
        // Component should be removed since it has no content
        expect(result).toContain("Before");
        expect(result).toContain("After");
        expect(result).not.toContain("empty-comp");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });

  describe("Deep nesting and MAX_DEPTH", () => {
    it("should handle deep component nesting up to MAX_DEPTH", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-should-handle-deep-nesting");
      const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        // Create deeply nested structure
        let htmlContent = `<!DOCTYPE html><html><body>`;
        
        // Create 52 levels of nesting (exceeds MAX_DEPTH of 50)
        for (let i = 0; i < 52; i++) {
          htmlContent += `<level-${i}>`;
        }
        for (let i = 51; i >= 0; i--) {
          htmlContent += `</level-${i}>`;
        }
        
        htmlContent += `</body></html>`;
        writeFileSync(join(TEST_DIR, "index.html"), htmlContent);

        // Create components that nest each other
        for (let i = 0; i < 52; i++) {
          const nextLevel = i < 51 ? `<level-${i + 1}></level-${i + 1}>` : "Bottom";
          writeFileSync(
            join(TEST_DIR, `level-${i}.com.ts`),
            `com.innerHTML = \`<div>Level ${i}: ${nextLevel}</div>\`;`
          );
        }

        await processComTs(TEST_DIR);

        // Should warn about exceeding MAX_DEPTH
        expect(consoleWarnSpy).toHaveBeenCalled();
      } finally {
        consoleWarnSpy?.mockRestore();
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle component with empty content", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-empty-content");

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html><body>
  <empty-comp></empty-comp>
  <p>After</p>
</body></html>`;

        const componentTs = `com.innerHTML = "";`; // Empty content

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "empty-comp.com.ts"), componentTs);

        await processComTs(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        
        // Component should be removed, but surrounding content preserved
        expect(result).not.toContain("<empty-comp>");
        expect(result).toContain("<p>After</p>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it("should handle component with null parent node edge case", async () => {
      const { dir: TEST_DIR } = getTestResources("processComTs-null-parent-edge-case");

      try {
        mkdirSync(TEST_DIR, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html><body>
  <div><orphan-comp></orphan-comp></div>
</body></html>`;

        // Component that returns empty/null innerHTML
        const componentTs = `
// This component will have empty content
com.innerHTML = "";
`;

        writeFileSync(join(TEST_DIR, "index.html"), indexHtml);
        writeFileSync(join(TEST_DIR, "orphan-comp.com.ts"), componentTs);

        await processComTs(TEST_DIR);

        const result = readFileSync(join(TEST_DIR, "index.html"), "utf-8");
        
        // Component with empty content should be removed
        expect(result).not.toContain("orphan-comp");
        expect(result).toContain("<div></div>");
      } finally {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });
  });
});
