# Testing Tkeron Projects

## Overview

Tkeron provides a `getBuildResult()` function that lets you test your built projects programmatically. This is useful for verifying that your components, pre-rendering scripts, and build output work correctly.

**Important:** These tests validate YOUR project's build output — not tkeron internals. You're testing that your HTML, components, and scripts produce the expected result after the build.

## Setup

Install tkeron as a dependency in your project:

```bash
bun add -d tkeron
```

## API

```typescript
import { getBuildResult, type BuildResult } from "tkeron";

const result: BuildResult = await getBuildResult("./websrc");
```

### BuildResult

`getBuildResult()` returns a `Record<string, FileInfo>` indexed by relative path:

```typescript
type BuildResult = Record<string, FileInfo>;

interface FileInfo {
  fileName: string; // "index.html"
  filePath: string; // "styles" or "" for root files
  path: string; // "styles/main.css" (the key)
  type: string; // MIME type: "text/html", "text/css", etc.
  size: number; // size in bytes
  fileHash: string; // SHA-256 hash
  getContentAsString?: () => string; // text files only
  dom?: Document; // HTML files only - parsed DOM
}
```

- `dom` is only present on `.html` files. It provides full DOM API: `querySelector()`, `getElementById()`, `querySelectorAll()`, etc.
- `getContentAsString()` is only present on text files (html, css, js, json, txt, svg, xml, ts, mjs, cjs, md, map).
- Binary files (images, fonts) only have metadata — no `dom` or `getContentAsString`.

## Test Structure

### Single Build with beforeAll

**Always** build once and share the result across tests. This is:

- Concurrent-safe (`bun test --concurrent`)
- Efficient (1 build instead of N builds)
- Reliable (no race conditions)

```typescript
import { describe, it, expect, beforeAll } from "bun:test";
import { getBuildResult, type BuildResult } from "tkeron";
import { join } from "path";

describe("my project", () => {
  const sourcePath = join(import.meta.dir, "src");
  let result: BuildResult;

  beforeAll(async () => {
    result = await getBuildResult(sourcePath);
  });

  it("should generate index.html", () => {
    expect(result?.["index.html"]).toBeDefined();
  });
});
```

**Never** call `getBuildResult()` inside each `it()` — this causes race conditions in concurrent mode.

## Testing Patterns

### 1. Verify File Existence

Check that expected output files exist:

```typescript
it("should generate expected files", () => {
  expect(result?.["index.html"]).toBeDefined();
  expect(result?.["index.js"]).toBeDefined();
  expect(result?.["styles/main.css"]).toBeDefined();
});
```

### 2. Verify Element Existence (Always Check First)

**Rule:** Always verify an element exists BEFORE checking its properties.

```typescript
// ✅ CORRECT: check existence first, then properties
it("should have login button", () => {
  const dom = result?.["index.html"]?.dom;

  const button = dom?.querySelector("#login-button");
  expect(button).toBeDefined();
  expect(button!.textContent).toBe("Log In");
});

// ❌ WRONG: accessing properties without checking existence
it("should have login button", () => {
  const dom = result?.["index.html"]?.dom;
  expect(dom!.querySelector("#login-button")!.textContent).toBe("Log In");
});
```

### 3. Verify Bounded Content

Test specific, short, predictable values — not full output strings.

```typescript
// ✅ GOOD: specific, bounded values
it("should have correct title", () => {
  const dom = result?.["index.html"]?.dom;

  const title = dom?.querySelector("title");
  expect(title).toBeDefined();
  expect(title!.textContent).toBe("My App");
});

// ✅ GOOD: keyword presence in compiled JS
it("should contain event handling logic", () => {
  const js = result?.["index.js"]?.getContentAsString!();
  expect(js).toContain("addEventListener");
});

// ❌ BAD: comparing full minified JS output (fragile, breaks on any optimization change)
it("should match exact JS", () => {
  const js = result?.["index.js"]?.getContentAsString!();
  expect(js).toBe('var t=0,e=document.querySelector("button")...');
});

// ❌ BAD: comparing full HTML output
it("should match exact HTML", () => {
  const html = result?.["index.html"]?.getContentAsString!();
  expect(html).toBe("<!doctype html><html>...");
});
```

**Why bounded:** Build output changes with optimizations, minification, and bundling. Test the **meaning**, not the **exact format**.

### 4. Verify DOM Elements (Specific Queries)

Test specific elements that matter to your project:

```typescript
it("should have navigation with correct links", () => {
  const dom = result?.["index.html"]?.dom;

  const homeLink = dom?.querySelector('nav a[href="/"]');
  expect(homeLink).toBeDefined();
  expect(homeLink!.textContent).toBe("Home");

  const aboutLink = dom?.querySelector('nav a[href="/about"]');
  expect(aboutLink).toBeDefined();
});

it("should have user profile section", () => {
  const dom = result?.["index.html"]?.dom;

  const profile = dom?.querySelector("#user-profile");
  expect(profile).toBeDefined();

  const avatar = profile?.querySelector("img.avatar");
  expect(avatar).toBeDefined();
  expect(avatar!.getAttribute("alt")).toBe("User avatar");
});
```

### 5. Verify Tkeron Transformations

Test that tkeron's build features work correctly in your project:

**Script injection (TypeScript → JavaScript):**

```typescript
it("should have compiled script in head", () => {
  const dom = result?.["index.html"]?.dom;

  const script = dom?.querySelector('script[type="module"]');
  expect(script).toBeDefined();
  expect(script!.getAttribute("src")).toBe("./index.js");
  expect(script!.parentElement!.tagName).toBe("HEAD");
});
```

**Component substitution (.com.html):**

```typescript
it("should have processed nav component", () => {
  const dom = result?.["index.html"]?.dom;

  // The <nav-menu> tag should be replaced by its .com.html content
  const nav = dom?.querySelector("nav");
  expect(nav).toBeDefined();

  const links = dom?.querySelectorAll("nav a");
  expect(links).toBeDefined();
  expect(links!.length).toBeGreaterThan(0);
});
```

**TypeScript component (.com.ts):**

```typescript
it("should have dynamically generated list", () => {
  const dom = result?.["index.html"]?.dom;

  const list = dom?.querySelector("#item-list");
  expect(list).toBeDefined();

  const items = list?.querySelectorAll("li");
  expect(items).toBeDefined();
  expect(items!.length).toBe(5);
});
```

**Pre-rendering (.pre.ts):**

```typescript
it("should have pre-rendered content", () => {
  const dom = result?.["index.html"]?.dom;

  const generated = dom?.querySelector("#generated-content");
  expect(generated).toBeDefined();
  expect(generated!.textContent).not.toBe("");
});
```

### 6. Verify File Metadata

```typescript
it("should have correct metadata", () => {
  expect(result?.["index.html"]?.type).toBe("text/html");
  expect(result?.["index.html"]?.size).toBeGreaterThan(0);
  expect(result?.["index.html"]?.fileHash).toBeDefined();
});

it("should not have DOM on non-HTML files", () => {
  expect(result?.["index.js"]?.dom).toBeUndefined();
});

it("should have correct path info for nested files", () => {
  expect(result?.["pages/about.html"]?.fileName).toBe("about.html");
  expect(result?.["pages/about.html"]?.filePath).toBe("pages");
});
```

## Complete Example

Here's a complete test file for a tkeron project with components:

```typescript
import { describe, it, expect, beforeAll } from "bun:test";
import { getBuildResult, type BuildResult } from "tkeron";
import { join } from "path";

describe("my-website build", () => {
  const sourcePath = join(import.meta.dir, "websrc");
  let result: BuildResult;

  beforeAll(async () => {
    result = await getBuildResult(sourcePath);
  });

  it("should generate expected files", () => {
    expect(result?.["index.html"]).toBeDefined();
    expect(result?.["index.js"]).toBeDefined();
    expect(result?.["about.html"]).toBeDefined();
  });

  it("should have page title", () => {
    const dom = result?.["index.html"]?.dom;

    const title = dom?.querySelector("title");
    expect(title).toBeDefined();
    expect(title!.textContent).toBe("My Website");
  });

  it("should have navigation from component", () => {
    const dom = result?.["index.html"]?.dom;

    const nav = dom?.querySelector("nav");
    expect(nav).toBeDefined();

    const homeLink = dom?.querySelector('nav a[href="/"]');
    expect(homeLink).toBeDefined();
    expect(homeLink!.textContent).toBe("Home");
  });

  it("should have footer from component", () => {
    const dom = result?.["index.html"]?.dom;

    const footer = dom?.querySelector("footer");
    expect(footer).toBeDefined();
  });

  it("should have compiled JavaScript", () => {
    const js = result?.["index.js"]?.getContentAsString!();

    expect(js).toBeDefined();
    expect(js!.length).toBeGreaterThan(0);
  });

  it("should have script injected in head", () => {
    const dom = result?.["index.html"]?.dom;

    const script = dom?.querySelector('head script[type="module"]');
    expect(script).toBeDefined();
    expect(script!.getAttribute("src")).toBe("./index.js");
  });
});
```

## Rules Summary

1. **Build once** with `beforeAll()` — never inside individual tests
2. **Check existence first** — always `expect(element).toBeDefined()` before accessing properties
3. **Use optional chaining** (`?.`) for safe property access on result entries
4. **Test bounded content** — specific values, keywords, attributes; not full output strings
5. **Test specific elements** — query for elements that matter to your project
6. **Verify transformations** — components processed, scripts injected, pre-rendering applied
7. **Don't test the parser** — you're testing your project, not tkeron internals
8. **Concurrent-safe** — tests must work with `bun test --concurrent`
