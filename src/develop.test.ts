import { it, expect, afterEach, beforeEach } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { develop } from "./develop";

let testDir: string;
let logs: string[];
let originalLog: typeof console.log;

beforeEach(() => {
  logs = [];
  originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };
});

afterEach(async () => {
  console.log = originalLog;
  
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
});

it("develop starts server and serves files", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Test</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });

  expect(logs.some(log => log.includes("🔨 Building project..."))).toBe(true);
  expect(logs.some(log => log.includes("✅ Build complete!"))).toBe(true);
  expect(logs.some(log => log.includes(`🚀 Development server running at http://localhost:${port}`))).toBe(true);

  const response = await fetch(`http://localhost:${port}/`);
  expect(response.status).toBe(200);
  
  const text = await response.text();
  expect(text).toContain("Test");

  server.stop();
}, 10000);

it("develop rebuilds on file change", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Original</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });

  let response = await fetch(`http://localhost:${port}/`);
  let text = await response.text();
  expect(text).toContain("Original");

  const initialLogCount = logs.length;
  
  await writeFile(join(sourceDir, "index.html"), "<h1>Modified</h1>");

  for (let i = 0; i < 30; i++) {
    if (logs.slice(initialLogCount).some(log => log.includes("📝 File changed:"))) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect(logs.slice(initialLogCount).some(log => log.includes("📝 File changed:"))).toBe(true);
  expect(logs.slice(initialLogCount).some(log => log.includes("🔨 Rebuilding..."))).toBe(true);

  for (let i = 0; i < 30; i++) {
    const newLogs = logs.slice(initialLogCount);
    const rebuildComplete = newLogs.filter(log => log.includes("✅ Build complete!")).length > 0;
    if (rebuildComplete) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  response = await fetch(`http://localhost:${port}/`);
  text = await response.text();
  expect(text).toContain("Modified");

  server.stop();
}, 10000);

it("develop serves 404 for missing files", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Test</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });

  const response = await fetch(`http://localhost:${port}/missing.html`);
  expect(response.status).toBe(404);

  server.stop();
}, 10000);
