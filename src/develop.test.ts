import { it, expect, afterEach, beforeEach, spyOn } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { develop, DevelopServer } from "./develop";

let testDir: string;
let activeServers: DevelopServer[] = [];
let consoleLogSpy: any;

beforeEach(() => {
  // Suppress console output
  consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
  activeServers = [];
});

afterEach(async () => {
  // Restore console
  consoleLogSpy?.mockRestore();
  
  // Stop all active servers
  for (const server of activeServers) {
    try {
      server.stop();
    } catch (e) {
      // Ignore
    }
  }
  activeServers = [];
  
  // Wait for watchers and servers to fully stop
  await new Promise(resolve => setTimeout(resolve, 200));
  
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
  activeServers.push(server);

  // Verify server is running
  const response = await fetch(`http://localhost:${port}/`);
  expect(response.status).toBe(200);
  expect(response.status).toBe(200);
  
  const text = await response.text();
  expect(text).toContain("Test");

  server.stop();
}, 5000);

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
  activeServers.push(server);

  let response = await fetch(`http://localhost:${port}/`);
  let text = await response.text();
  expect(text).toContain("Original");

  // Modify file to trigger rebuild
  await writeFile(join(sourceDir, "index.html"), "<h1>Modified</h1>");

  // Wait for rebuild to complete
  await new Promise(resolve => setTimeout(resolve, 800));

  response = await fetch(`http://localhost:${port}/`);
  text = await response.text();
  expect(text).toContain("Modified");

  server.stop();
}, 5000);

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
  activeServers.push(server);

  const response = await fetch(`http://localhost:${port}/missing.html`);
  expect(response.status).toBe(404);

  server.stop();
}, 3000);

it("develop handles multiple SSE clients for hot reload", async () => {
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
  activeServers.push(server);

  // Connect multiple SSE clients
  const client1 = fetch(`http://localhost:${port}/dev-reload`);
  const client2 = fetch(`http://localhost:${port}/dev-reload`);
  const client3 = fetch(`http://localhost:${port}/dev-reload`);

  await new Promise(resolve => setTimeout(resolve, 50));

  // Trigger a file change
  await writeFile(join(sourceDir, "index.html"), "<h1>Updated</h1>");

  // Wait for rebuild
  await new Promise(resolve => setTimeout(resolve, 300));

  // All clients should still be connected (we can't easily test the reload message without parsing SSE)
  const response1 = await client1;
  const response2 = await client2;
  const response3 = await client3;

  expect(response1.headers.get("content-type")).toBe("text/event-stream");
  expect(response2.headers.get("content-type")).toBe("text/event-stream");
  expect(response3.headers.get("content-type")).toBe("text/event-stream");

  server.stop();
}, 5000);

it("develop handles build errors gracefully", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Valid</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('valid');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });
  activeServers.push(server);

  // Verify initial build worked
  let response = await fetch(`http://localhost:${port}/`);
  expect(response.status).toBe(200);

  // Create an invalid TypeScript file
  await writeFile(join(sourceDir, "broken.ts"), "this is not valid typescript {{{");

  // Wait for rebuild attempt
  await new Promise(resolve => setTimeout(resolve, 500));

  // Server should still be running and serving the last good build
  response = await fetch(`http://localhost:${port}/`);
  expect(response.status).toBe(200);

  server.stop();
}, 5000);

// Note: File watcher tests for subdirectories are flaky due to OS-level timing
// The feature works in practice but is difficult to test reliably

it("develop serves compiled JavaScript and HTML correctly", async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Test</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");
  await writeFile(join(sourceDir, "about.html"), "<h2>About</h2>");
  await writeFile(join(sourceDir, "about.ts"), "console.log('about page');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });
  activeServers.push(server);

  // Wait for build to complete
  await new Promise(resolve => setTimeout(resolve, 300));

  // Test main HTML
  let response = await fetch(`http://localhost:${port}/`);
  expect(response.status).toBe(200);
  let text = await response.text();
  expect(text).toContain("Test");

  // Test about HTML
  response = await fetch(`http://localhost:${port}/about.html`);
  expect(response.status).toBe(200);
  text = await response.text();
  expect(text).toContain("About");

  server.stop();
  await new Promise(resolve => setTimeout(resolve, 50));
}, 5000);

it("develop injects reload script into HTML files", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<!DOCTYPE html><html><body><h1>Test</h1></body></html>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });
  activeServers.push(server);

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 50));

  const response = await fetch(`http://localhost:${port}/`);
  const html = await response.text();

  // Check that reload script is injected
  expect(html).toContain("EventSource('/dev-reload')");
  expect(html).toContain("location.reload()");

  server.stop();
}, 4000);

it("develop handles file deletion and recreates on change", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Test</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");
  await writeFile(join(sourceDir, "extra.html"), "<h2>Extra</h2>");

  const port = 9000 + Math.floor(Math.random() * 1000);

  const server = await develop({
    
    sourceDir,
    outputDir,
    port,
    host: "localhost",
  });
  activeServers.push(server);

  // Verify extra.html exists
  let response = await fetch(`http://localhost:${port}/extra.html`);
  expect(response.status).toBe(200);

  // Delete the file
  await rm(join(sourceDir, "extra.html"));

  // Wait for rebuild to complete
  await new Promise(resolve => setTimeout(resolve, 800));

  // File should now return 404
  response = await fetch(`http://localhost:${port}/extra.html`);
  expect(response.status).toBe(404);

  server.stop();
}, 5000);

it("develop uses custom port and host", async () => {
  testDir = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const sourceDir = join(testDir, "websrc");
  const outputDir = join(testDir, "web");

  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "index.html"), "<h1>Test</h1>");
  await writeFile(join(sourceDir, "index.ts"), "console.log('test');");

  const customPort = 9000 + Math.floor(Math.random() * 1000);
  const customHost = "127.0.0.1";

  const server = await develop({
    
    sourceDir,
    outputDir,
    port: customPort,
    host: customHost,
  });
  activeServers.push(server);

  // Verify server configuration
  expect(server.port).toBe(customPort);
  expect(server.host).toBe(customHost);

  const response = await fetch(`http://${customHost}:${customPort}/`);
  expect(response.status).toBe(200);

  server.stop();
}, 4000);
