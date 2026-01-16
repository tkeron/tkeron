import { describe, it, expect } from "bun:test";
import { buildDir } from "./buildDir";
import { buildEntrypoints } from "./buildEntrypoints";
import { rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { getTestResources, createTestLogger, silentLogger } from "./test-helpers";

describe("buildDir", () => {
  it("should return early and log error when sourceDir is invalid", async () => {
    const { logger, errors } = createTestLogger();
    
    // Test with empty string sourceDir
    await buildDir("", "/tmp/out", { logger });
    expect(errors.some(e => e.includes("Invalid sourceDir or targetDir"))).toBe(true);
  });

  it("should return early and log error when targetDir is invalid", async () => {
    const { logger, errors } = createTestLogger();
    
    // Test with empty string targetDir
    await buildDir("/tmp/src", "", { logger });
    expect(errors.some(e => e.includes("Invalid sourceDir or targetDir"))).toBe(true);
  });

  it("should return early and log error when sourceDir is not a string", async () => {
    const { logger, errors } = createTestLogger();
    
    await buildDir(null as any, "/tmp/out", { logger });
    expect(errors.some(e => e.includes("Invalid sourceDir or targetDir"))).toBe(true);
  });

  it("should return early and log error when targetDir is not a string", async () => {
    const { logger, errors } = createTestLogger();
    
    await buildDir("/tmp/src", null as any, { logger });
    expect(errors.some(e => e.includes("Invalid sourceDir or targetDir"))).toBe(true);
  });

  it("should build HTML files to target directory", async () => {
    const { dir } = getTestResources("buildDir-build-html");
    const TEST_SRC = join(dir, "src");
    const TEST_OUT = join(dir, "out");
    
    try {
      mkdirSync(TEST_SRC, { recursive: true });
      writeFileSync(join(TEST_SRC, "index.html"), "<!DOCTYPE html><html><body><h1>Test</h1></body></html>");
      writeFileSync(join(TEST_SRC, "index.ts"), "console.log('test');");
      
      await buildDir(TEST_SRC, TEST_OUT, { logger: silentLogger });
      
      expect(existsSync(join(TEST_OUT, "index.html"))).toBe(true);
      expect(existsSync(join(TEST_OUT, "index.js"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should filter out .com.html files", async () => {
    const { dir } = getTestResources("buildDir-filter-com-html");
    const TEST_SRC = join(dir, "src");
    const TEST_OUT = join(dir, "out");
    
    try {
      mkdirSync(TEST_SRC, { recursive: true });
      writeFileSync(join(TEST_SRC, "index.html"), "<!DOCTYPE html><html><body><h1>Test</h1></body></html>");
      writeFileSync(join(TEST_SRC, "component.com.html"), "<div>Component</div>");
      
      await buildDir(TEST_SRC, TEST_OUT, { logger: silentLogger });
      
      expect(existsSync(join(TEST_OUT, "index.html"))).toBe(true);
      expect(existsSync(join(TEST_OUT, "component.com.html"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should normalize doctype to lowercase", async () => {
    const { dir } = getTestResources("buildDir-normalize-doctype");
    const TEST_SRC = join(dir, "src");
    const TEST_OUT = join(dir, "out");
    
    try {
      mkdirSync(TEST_SRC, { recursive: true });
      writeFileSync(join(TEST_SRC, "index.html"), "<!DOCTYPE HTML><html><body><h1>Test</h1></body></html>");
      
      await buildDir(TEST_SRC, TEST_OUT, { logger: silentLogger });
      
      const outputHtml = readFileSync(join(TEST_OUT, "index.html"), "utf-8");
      expect(outputHtml).toContain("<!doctype html>");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("buildEntrypoints", () => {
  it("should return early and log error when filePaths is empty", async () => {
    const { logger, errors } = createTestLogger();
    
    const result = await buildEntrypoints([], "/tmp/root", { logger });
    expect(result).toBeUndefined();
    expect(errors.some(e => e.includes("No entrypoints provided"))).toBe(true);
  });

  it("should return early and log error when filePaths is null", async () => {
    const { logger, errors } = createTestLogger();
    
    const result = await buildEntrypoints(null as any, "/tmp/root", { logger });
    expect(result).toBeUndefined();
    expect(errors.some(e => e.includes("No entrypoints provided"))).toBe(true);
  });

  it("should return early and log error when filePaths is not an array", async () => {
    const { logger, errors } = createTestLogger();
    
    const result = await buildEntrypoints("not-an-array" as any, "/tmp/root", { logger });
    expect(result).toBeUndefined();
    expect(errors.some(e => e.includes("No entrypoints provided"))).toBe(true);
  });

  it("should return early and log error when root is empty", async () => {
    const { logger, errors } = createTestLogger();
    
    const result = await buildEntrypoints(["file.html"], "", { logger });
    expect(result).toBeUndefined();
    expect(errors.some(e => e.includes("Invalid root provided"))).toBe(true);
  });

  it("should return early and log error when root is not a string", async () => {
    const { logger, errors } = createTestLogger();
    
    const result = await buildEntrypoints(["file.html"], null as any, { logger });
    expect(result).toBeUndefined();
    expect(errors.some(e => e.includes("Invalid root provided"))).toBe(true);
  });

  it("should build entrypoints and return artifacts", async () => {
    const { dir } = getTestResources("buildEntrypoints-artifacts");
    
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.html"), "<!DOCTYPE html><html><body><h1>Test</h1><script src='./main.ts'></script></body></html>");
      writeFileSync(join(dir, "main.ts"), "console.log('hello');");
      
      const result = await buildEntrypoints([join(dir, "index.html")], dir, { logger: silentLogger });
      
      expect(result).toBeDefined();
      expect(result?.artifacts).toBeDefined();
      expect(result?.artifacts.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
