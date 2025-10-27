import { describe, test, expect, afterAll } from "bun:test";
import { build } from "./build";
import { rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("build", () => {
  const TEST_DIR = join(tmpdir(), `tkeron-test-${Date.now()}`);
  const TEST_SRC = join(TEST_DIR, "src");
  const TEST_OUT = join(TEST_DIR, "webout");

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test("should build HTML with TypeScript and inject bundled script", async () => {
    mkdirSync(TEST_SRC, { recursive: true });
    const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>Test</h1>
  <script type="module" src="./index.ts"></script>
</body>
</html>`;

    const tsContent = `const message: string = "hello"; console.log(message);`;

    writeFileSync(join(TEST_SRC, "index.html"), htmlContent);
    writeFileSync(join(TEST_SRC, "index.ts"), tsContent);

    await build({
      sourceDir: TEST_SRC,
      targetDir: TEST_OUT,
    });

    expect(existsSync(join(TEST_OUT, "index.html"))).toBe(true);
    expect(existsSync(join(TEST_OUT, "index.js"))).toBe(true);
    
    const outputHtml = readFileSync(join(TEST_OUT, "index.html"), "utf-8");
    expect(outputHtml).toContain("index.js");
  });
});
