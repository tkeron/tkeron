import { describe, it, expect, beforeAll } from "bun:test";
import { getBuildResult, type BuildResult } from "tkeron";
import { join } from "path";

describe("basic_build example", () => {
  const sourcePath = join(import.meta.dir, "src");
  let result: BuildResult;

  beforeAll(async () => {
    result = await getBuildResult(sourcePath);
  });

  it("should build successfully and return index.html and index.js", () => {
    expect(result?.["index.html"]).toBeDefined();
    expect(result?.["index.js"]).toBeDefined();
  });

  it("should have correct file metadata for index.html", () => {
    expect(result?.["index.html"]?.fileName).toBe("index.html");
    expect(result?.["index.html"]?.filePath).toBe("");
    expect(result?.["index.html"]?.path).toBe("index.html");
    expect(result?.["index.html"]?.type).toBe("text/html");
    expect(result?.["index.html"]?.size).toBeGreaterThan(0);
    expect(result?.["index.html"]?.fileHash).toBeDefined();
  });

  it("should have parsed DOM for index.html", () => {
    const dom = result?.["index.html"]?.dom;

    expect(dom).toBeDefined();
    expect(dom!.documentElement.tagName).toBe("HTML");
  });

  it("should have h1 with initial counter text", () => {
    const dom = result?.["index.html"]?.dom;

    const h1 = dom?.querySelector("h1");
    expect(h1).toBeDefined();
    expect(h1!.textContent).toBe("Clicks: 0");
  });

  it("should have button element", () => {
    const dom = result?.["index.html"]?.dom;

    const button = dom?.querySelector("button");
    expect(button).toBeDefined();
    expect(button!.textContent).toBe("Tap");
  });

  it("should have script tag with compiled JS reference", () => {
    const dom = result?.["index.html"]?.dom;

    const script = dom?.querySelector('script[type="module"]');
    expect(script).toBeDefined();
    expect(script!.getAttribute("src")).toBe("./index.js");
    expect(script!.hasAttribute("crossorigin")).toBe(true);
  });

  it("should have script tag in head (injected by tkeron)", () => {
    const dom = result?.["index.html"]?.dom;

    const script = dom?.querySelector('script[type="module"]');
    expect(script!.parentElement!.tagName).toBe("HEAD");
  });

  it("should have meta tags", () => {
    const dom = result?.["index.html"]?.dom;

    const charset = dom?.querySelector('meta[charset="UTF-8"]');
    expect(charset).toBeDefined();

    const viewport = dom?.querySelector('meta[name="viewport"]');
    expect(viewport).toBeDefined();
    expect(viewport!.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1.0",
    );
  });

  it("should have compiled JavaScript content", () => {
    expect(result?.["index.js"]?.getContentAsString).toBeDefined();
    const jsContent = result?.["index.js"]?.getContentAsString!();

    expect(jsContent?.length).toBeGreaterThan(0);
    expect(jsContent).toContain("button");
    expect(jsContent).toContain("querySelector");
  });

  it("should have correct metadata for index.js", () => {
    expect(result?.["index.js"]?.fileName).toBe("index.js");
    expect(result?.["index.js"]?.filePath).toBe("");
    expect(result?.["index.js"]?.path).toBe("index.js");
    expect(result?.["index.js"]?.type).toBe("text/javascript");
    expect(result?.["index.js"]?.size).toBeGreaterThan(0);
    expect(result?.["index.js"]?.fileHash).toBeDefined();
    expect(result?.["index.js"]?.dom).toBeUndefined();
  });

  it("should contain counter logic in JavaScript", () => {
    const jsContent = result?.["index.js"]?.getContentAsString!();

    expect(jsContent).toContain("Clicks:");
  });

  it("should contain addEventListener in JavaScript", () => {
    const jsContent = result?.["index.js"]?.getContentAsString!();

    expect(jsContent).toContain("addEventListener");
  });

  it("should have HTML content accessible via getContentAsString", () => {
    const htmlContent = result?.["index.html"]?.getContentAsString!();

    expect(htmlContent).toContain("<!doctype html>");
    expect(htmlContent).toContain("<h1>Clicks: 0</h1>");
    expect(htmlContent).toContain("<button>Tap</button>");
  });

  it("should have consistent hashes across multiple builds", async () => {
    const result2 = await getBuildResult(sourcePath);

    expect(result?.["index.html"]?.fileHash).toBe(result2?.["index.html"]?.fileHash);
    expect(result?.["index.js"]?.fileHash).toBe(result2?.["index.js"]?.fileHash);
  });

  it("should only have two files in output", () => {
    const files = Object.keys(result);

    expect(files.length).toBe(2);
    expect(files).toContain("index.html");
    expect(files).toContain("index.js");
  });
});
