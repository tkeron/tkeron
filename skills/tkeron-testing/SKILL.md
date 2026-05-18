---
name: tkeron-testing
description: "Testing tkeron projects programmatically with getBuildResult() from the 'tkeron' package. Covers the full BuildResult API (dom, getContentAsString, type, size, fileHash), Bun test setup, recipes (assert components inlined, meta tags present, TS compiled), and the rules for fast, deterministic tests. Use this skill when writing or debugging tests for a tkeron project."
---

# Tkeron — Testing

Tkeron exposes `getBuildResult()` for programmatic testing of the build output. It runs a real build into a temporary directory, returns a structured map of every output file, and cleans up afterwards.

## Basic Setup (Bun test)

```typescript
import { describe, it, expect, beforeAll } from "bun:test";
import { getBuildResult, type BuildResult } from "tkeron";
import { join } from "path";

describe("my project", () => {
  const sourcePath = join(import.meta.dir, "websrc");
  let result: BuildResult;

  beforeAll(async () => {
    result = await getBuildResult(sourcePath);
  });

  it("generates index.html", () => {
    expect(result["index.html"]).toBeDefined();
  });

  it("has the correct title", () => {
    const dom = result["index.html"]?.dom;
    const title = dom?.querySelector("title");
    expect(title).toBeDefined();
    expect(title!.textContent).toBe("My Site");
  });
});
```

---

## API

### `getBuildResult(sourcePath, options?) => Promise<BuildResult>`

| Param        | Type                  | Notes                                                      |
| ------------ | --------------------- | ---------------------------------------------------------- |
| `sourcePath` | `string`              | Absolute path to the `websrc/` directory.                  |
| `options`    | `{ logger?: Logger }` | Optional. Pass a custom logger; omit for silent (default). |

Returns a `BuildResult` — a record keyed by the relative output path (e.g. `"index.html"`, `"blog/post.html"`, `"styles/main.css"`).

### `FileInfo` — value of each entry

```typescript
interface FileInfo {
  fileName: string; // "index.html"
  filePath: string; // "" for root, "blog" for blog/index.html
  path: string; // "index.html" / "blog/post.html"
  type: string; // MIME type (e.g. "text/html")
  size: number; // bytes
  fileHash: string; // sha256 of the output
  getContentAsString?: () => string; // ONLY for text files
  dom?: Document; // ONLY for .html (parsed by @tkeron/html-parser)
}
```

Text files (`html`, `css`, `js`, `json`, `txt`, `svg`, `xml`, `ts`, `md`, etc.) get `getContentAsString`. Only `.html` files get `dom`.

> **`dom` is from `@tkeron/html-parser`, not jsdom**. It supports `querySelector`, `querySelectorAll`, `textContent`, `getAttribute`, `innerHTML`, etc. Do NOT assume jsdom-only APIs (no `getComputedStyle`, no event dispatch, no `MutationObserver`).

---

## Rules

1. **Build ONCE in `beforeAll()`**, NEVER inside each `it()` — a build can take seconds.
2. **Check existence BEFORE properties**: `expect(el).toBeDefined()` → then `el!.textContent`.
3. **Assert specific, bounded values**, not full output — whitespace/minification changes break brittle tests.
4. **Use `dom` for HTML assertions**, `getContentAsString()` for CSS/JS string searches.
5. **Use absolute paths** for `sourcePath` (`join(import.meta.dir, "websrc")`).
6. **Tests do not need to clean up** — `getBuildResult` removes its temp directory automatically.

---

## Recipes

### Assert a component was inlined

```typescript
it("inlines <site-header>", () => {
  const html = result["index.html"]?.getContentAsString?.() ?? "";
  expect(html).not.toContain("<site-header>");
  expect(html).toContain('class="site-header"');
});
```

### Assert meta tags from `.pre.ts`

```typescript
it("sets canonical from page-meta util", () => {
  const dom = result["about.html"]?.dom;
  const canonical = dom?.querySelector('link[rel="canonical"]');
  expect(canonical?.getAttribute("href")).toBe("https://example.com/about");
});
```

### Assert TS was compiled and reference rewritten

```typescript
it("rewrites .ts to .js in the page", () => {
  const html = result["index.html"]?.getContentAsString?.() ?? "";
  expect(html).toMatch(/src="\.\/index\.js"/);
  expect(result["index.js"]).toBeDefined();
});
```

### Assert `.post.ts` ran on external links

```typescript
it("post.ts adds rel/target to external links", () => {
  const dom = result["index.html"]?.dom;
  const link = dom?.querySelector('a[href^="http"]');
  expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  expect(link?.getAttribute("target")).toBe("_blank");
});
```

### Assert a `.com.ts` rendered each instance with its attributes

```typescript
it("user-badge renders one card per instance", () => {
  const dom = result["index.html"]?.dom;
  const cards = dom?.querySelectorAll(".badge");
  expect(cards?.length).toBe(3);
  expect(cards?.[0].querySelector(".badge-name")?.textContent).toBe("Alice");
});
```

### Assert intermediate files do NOT appear in output

```typescript
it("does not emit .com.* or .pre.ts files", () => {
  const paths = Object.keys(result);
  expect(paths.some((p) => p.endsWith(".com.html"))).toBe(false);
  expect(paths.some((p) => p.endsWith(".com.ts"))).toBe(false);
  expect(paths.some((p) => p.endsWith(".pre.ts"))).toBe(false);
  expect(paths.some((p) => p.endsWith(".post.ts"))).toBe(false);
});
```

### Assert sub-route page exists

```typescript
it("emits blog/index.html as the /blog/ route", () => {
  expect(result["blog/index.html"]).toBeDefined();
  expect(result["blog/index.html"]?.filePath).toBe("blog");
});
```

### Assert hash/size constraints (output budget)

```typescript
it("CSS bundle stays under 50 KB", () => {
  const css = result["styles/main.css"];
  expect(css).toBeDefined();
  expect(css!.size).toBeLessThan(50_000);
});
```

---

## Running Tests

```bash
bun test                          # all tests
bun test src/foo.test.ts          # one file
bun test --watch                  # watch mode
NODE_ENV=production bun test      # if your build depends on env
```

`getBuildResult` honors the same `NODE_ENV` as a normal `tk build`, so you can test prod-only behavior (analytics scripts, dev banners) by setting it.

---

## Common Test Failures

| Symptom                               | Likely cause                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `result["index.html"]` is `undefined` | Wrong `sourcePath`, or `index.html` was renamed/moved.                       |
| `dom.querySelector(...)` returns null | Selector doesn't match — remember the wrapper custom tag is gone.            |
| `el.textContent` is empty             | `.pre.ts`/`.post.ts` didn't run, or template wasn't loaded.                  |
| Test passes locally, fails in CI      | Missing env var (`NODE_ENV`), or absolute paths assumed.                     |
| Slow test suite                       | Building inside `it()` — move to `beforeAll`.                                |
| Type error on `dom?.querySelector`    | Import `Document` from your test setup or cast — the dom is parser-flavored. |

For build-time errors (the build itself fails), see `tkeron-troubleshooting`.
