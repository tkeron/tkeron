---
name: tkeron-patterns
description: "Tkeron implementation patterns, anti-patterns, and the mandatory maximum pre-render rule. Use this skill when writing or reviewing tkeron code — components, pre/post scripts, browser TS — to apply correct patterns (escapeHtml, parallel fetch, shared meta utils, attribute validation) and avoid common anti-patterns (building UI in JS, .js refs, absolute paths, event listeners in .com.ts, browser APIs at build time, fetch without timeout, silent errors). Also covers basic security and performance."
---

# Tkeron — Patterns, Anti-Patterns and the Max-Pre-render Rule

## ⚡ Maximum Pre-render (MANDATORY)

**FUNDAMENTAL RULE**: The HTML structure of the page is defined in `websrc/*.html` or in Tkeron components (`.com.html` / `.com.ts`). Browser JS **only fills data** into already existing nodes. It is FORBIDDEN to build entire UI structure from scratch in client-side JS.

### Render hierarchy — from highest to lowest priority

| Level                                            | What goes here                                       | Examples                                                               |
| ------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **1. `websrc/*.html` (always)**                  | All fixed structure of the page                      | `<thead>`, labels, tabs, containers, headers, buttons, empty KPI cards |
| **2. `.com.html` / `.com.ts` (build time)**      | HTML shared across pages or with build-time variants | `<app-nav>`, KPI cards with structure, badges                          |
| **3. `.pre.ts` (build time with data)**          | Data available at build time                         | Static config, feature flags, build-time fetch                         |
| **4. `.post.ts` (build time, after components)** | Final DOM rewrites once components are resolved      | `rel="noopener"`, `loading="lazy"`, auto heading ids, TOC              |
| **5. Browser JS — DATA ONLY**                    | The only valid use: fill already existing nodes      | `el.textContent = val`, `el.setAttribute(...)`, `.classList.add(...)`  |
| **6. Browser JS — builds DOM**                   | Last resort, only when absolutely necessary          | Table rows whose count changes with user data                          |

### Most common mistake: empty app waiting for JS

```html
❌ BAD — the whole UI is built in JS, the HTML is a shell:
<div id="dashboard" style="display:none"></div>
<div class="loading">Loading...</div>
<!-- user sees a blank screen until the fetch completes -->
```

```html
✅ GOOD — full structure in HTML, pending numbers with a placeholder:
<div class="kpi-grid">
  <div class="kpi-card kpi-critical">
    <span class="kpi-number" id="kpi-critical-val">·</span>
    <span class="kpi-label">Critical</span>
  </div>
</div>
<!-- JS only: document.getElementById("kpi-critical-val").textContent = s.critical -->
```

### Quick test: is it pre-rendered enough?

> If the API returns empty data (`[]` or `{}`), does the page still show structure (headers, columns, labels)? If yes → correct. If the page is blank → **the HTML lacks enough pre-render**.

### When it IS valid to build DOM in JS

| Case                                 | Build in JS?                       | Why                               |
| ------------------------------------ | ---------------------------------- | --------------------------------- |
| Product table rows                   | ✅                                 | Row count depends on user data    |
| Table structure (`<thead>`, columns) | ❌                                 | Always in HTML, never built in JS |
| KPI cards (changing numbers)         | ❌ for structure, ✅ for the value | Card in HTML, number set by JS    |
| Banners that appear/disappear        | ✅                                 | Created and destroyed dynamically |
| Tabs, sections, labels               | ❌                                 | Always in HTML                    |
| Conditional text ("·" → real value)  | ✅                                 | `el.textContent = value`          |

---

## ✅ Patterns — Do

### Component with interactivity (build + runtime)

```html
<!-- counter-btn.com.html -->
<button class="counter-button" data-count="0">
  Count: <span class="count">0</span>
</button>
```

```typescript
// index.ts (browser)
document.querySelectorAll(".counter-button").forEach((btn) => {
  let count = 0;
  btn.addEventListener("click", () => {
    count++;
    const span = btn.querySelector(".count");
    if (span) span.textContent = count.toString();
  });
});
```

### Pre-render with fetch + timeout (ALWAYS use AbortController)

```typescript
// index.pre.ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch("https://api.example.com/posts", {
    signal: controller.signal,
  });
  const posts = await res.json();
  const container = document.getElementById("posts");
  if (container) {
    container.innerHTML = posts
      .map(
        (p: { title: string }) =>
          `<article><h2>${escapeHtml(p.title)}</h2></article>`,
      )
      .join("");
  }
} catch {
  console.warn("API fetch failed, using fallback");
}
```

### Parallel fetch in pre-render

```typescript
// index.pre.ts
const [posts, authors, tags] = await Promise.all([
  fetch("https://api.example.com/posts").then((r) => r.json()),
  fetch("https://api.example.com/authors").then((r) => r.json()),
  fetch("https://api.example.com/tags").then((r) => r.json()),
]);
```

### Shared `<head>` meta tags via a `.pre.ts` util

The `<head>` (title, description, og:\*, canonical) has identical structure across pages — only the values change. Canonical pattern: a build-time util in `websrc/utils/` imported from each page's `.pre.ts`.

```typescript
// websrc/utils/page-meta.ts
export interface PageMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl: string;
  canonical?: string;
  ogType?: "website" | "article";
}

export function applyPageMeta(doc: Document, meta: PageMeta): void {
  const setMeta = (sel: string, attr: string, val: string) => {
    let el = doc.querySelector<HTMLElement>(sel);
    if (!el) {
      el = doc.createElement("meta");
      doc.head!.appendChild(el);
    }
    el.setAttribute(attr, val);
  };
  const title = doc.querySelector("title");
  if (title) title.textContent = meta.title;
  setMeta('meta[name="description"]', "content", meta.description);
  setMeta('meta[property="og:title"]', "content", meta.ogTitle ?? meta.title);
  setMeta(
    'meta[property="og:description"]',
    "content",
    meta.ogDescription ?? meta.description,
  );
  setMeta('meta[property="og:url"]', "content", meta.ogUrl);
  setMeta('link[rel="canonical"]', "href", meta.canonical ?? meta.ogUrl);
  if (meta.ogType) setMeta('meta[property="og:type"]', "content", meta.ogType);
}
```

```typescript
// websrc/about.pre.ts
import { applyPageMeta } from "./utils/page-meta.ts";

applyPageMeta(document, {
  title: "About | My Site",
  description: "Who we are and what we do.",
  ogUrl: "https://example.com/about",
  ogType: "website",
});
```

Benefit: adding `og:image` or JSON-LD to all pages = a single change in `page-meta.ts`.

### Attribute validation in `.com.ts`

```typescript
// alert-box.com.ts
const validTypes = ["info", "success", "warning", "error"] as const;
type AlertType = (typeof validTypes)[number];

const type = (com.getAttribute("type") || "info") as AlertType;
if (!validTypes.includes(type)) {
  throw new Error(`Invalid type: ${type}. Allowed: ${validTypes.join(", ")}`);
}

const message = com.getAttribute("message") || "";
com.innerHTML = `
  <div class="alert alert-${type}">
    <strong>${type.toUpperCase()}</strong>
    <p>${escapeHtml(message)}</p>
  </div>
`;
```

### Conditional builds by environment

```typescript
// index.pre.ts
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const script = document.createElement("script");
  script.src = "https://analytics.example.com/script.js";
  document.body?.appendChild(script);
}

if (!isProd) {
  const banner = document.createElement("div");
  banner.textContent = "Development Mode";
  document.body?.insertBefore(banner, document.body.firstChild);
}
```

### CSS via components (NEVER `<link rel="stylesheet">`)

**Rule**: CSS in tkeron lives inside `<style>` blocks emitted by components. Pages MUST NOT use `<link rel="stylesheet">`. This unlocks three properties:

1. **Auto-dedup**: tkeron keeps a single `<style data-tk-com="...">` in `<head>` no matter how many times the component is used.
2. **Tree-shaking**: if a component is not used on a page, its CSS does not ship to that page.
3. **Zero extra requests**: CSS travels inside the HTML download → first paint without waiting for another request.

#### Per-component CSS — in `.com.html`

```html
<!-- card.com.html -->
<style>
  .card { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; }
</style>
<div class="card"></div>
```

```typescript
// card.com.ts (optional — only if logic is needed)
const body = com.querySelector(".card");
if (body) body.textContent = com.getAttribute("text") || "";
```

> If a `.com.html` exists next to a `.com.ts`, the HTML is loaded into `com.innerHTML` **before** the `.com.ts` runs. The `<style>` is preserved and dedup applies. Do NOT re-emit the `<style>` from `.com.ts`.

**Build output — dedup in action.** Component used 6 times → `<head>` receives exactly **one** `<style data-tk-com="tag-chip">` block:

```html
<!-- websrc/index.html — source has 6 <tag-chip> uses -->
<tag-chip label="TypeScript"></tag-chip>
<tag-chip label="HTML"></tag-chip>
<tag-chip label="CSS"></tag-chip>
<tag-chip label="Bun"></tag-chip>
<tag-chip label="tkeron"></tag-chip>
<tag-chip label="zero deps"></tag-chip>
```

```html
<!-- web/index.html — tkeron output -->
<head>
  <!-- ONE style block, regardless of how many times the component was used -->
  <style data-tk-com="tag-chip">
    .tag-chip { display: inline-block; background: ...; color: white; ... }
  </style>
</head>
<body>
  <span class="tag-chip">TypeScript</span>
  <span class="tag-chip">HTML</span>
  <span class="tag-chip">CSS</span>
  <span class="tag-chip">Bun</span>
  <span class="tag-chip">tkeron</span>
  <span class="tag-chip">zero deps</span>
</body>
```

#### Global CSS — keep `.css` file, inline via a component

For truly shared CSS (resets, tokens, body typography) you can keep a real `.css` file in source (so the editor gives you CSS tooling). Do **not** import it with `<link>`. Inline it through a build-time component — a `.com.ts` is the natural fit because it can read files at build time:

```typescript
// any-name.com.ts (e.g. global-styles.com.ts, site-css.com.ts — name is free,
// just respect the custom-element hyphen rule)
import { join } from "path";
const css = await Bun.file(join(__dirname, "main.css")).text();
com.innerHTML = `<style>${css}</style>`;
```

```html
<!-- any page -->
<head>
  <global-styles></global-styles>
</head>
```

The `.css` file can live wherever the user prefers (root of `websrc/`, next to the component, in a `styles/` folder — free choice). What matters is that the page references the **component**, not the `.css` file. Keep the global CSS **small**: it ships on every page. Anything component-specific belongs in that component's `.com.html`.

**Build output — `<link>` vs component.** Both source patterns compile, but the output is fundamentally different:

```html
<!-- ❌ websrc/page.html uses <link rel="stylesheet" href="./styles.css"> -->
<!-- web/page.html output: -->
<link rel="stylesheet" href="./page.css" />
<!-- + a separate page.css file is emitted next to page.html -->
<!-- = 1 extra HTTP request, blocks first paint -->
```

```html
<!-- ✅ websrc/page.html uses <global-styles></global-styles> -->
<!-- web/page.html output: -->
<style>
  /* full content of styles.css inlined — zero extra files, zero extra requests */
  :root { --accent: #38bdf8; }
  body { margin: 0; font-family: system-ui; }
</style>
<!-- no .css file emitted alongside page.html -->
```

---

## ❌ Anti-Patterns — Do NOT

### ❌ Building entire UI structure in browser JS (the main anti-pattern)

The most harmful anti-pattern: JS functions that build whole UI sections with `innerHTML` or `createElement`.

```typescript
// ❌ BAD — "renderDashboard" builds the entire structure from JS
function renderDashboard(data: Stats) {
  const el = document.getElementById("dashboard");
  if (!el) return;
  el.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><h3>Critical</h3><span>${data.critical}</span></div>
    </div>
    <table>
      <thead><tr><th>Product</th><th>Velocity</th></tr></thead>
      <tbody id="product-rows"></tbody>
    </table>
  `;
}
// User sees a blank screen while the fetch runs
```

```typescript
// ✅ GOOD — structure already in HTML, JS only fills the values
function updateDashboard(data: Stats) {
  const critical = document.getElementById("kpi-critical-val");
  if (critical) critical.textContent = String(data.critical);

  // Only the rows are dynamic — the table is already in the HTML
  const tbody = document.getElementById("product-rows");
  if (tbody) tbody.innerHTML = data.products.map(renderRow).join("");
}
```

**Golden rule**: if you are writing a `renderX` function that generates HTML structure from scratch (divs, headers, labels), that structure belongs in `websrc/*.html`, not in JS.

### ❌ Referencing `.js` in HTML (most common build error)

```html
<!-- ❌ BAD — causes "Bundle failed" / "Cannot resolve" -->
<script src="index.js"></script>

<!-- ✅ GOOD — tkeron compiles .ts → .js automatically -->
<script type="module" src="./index.ts"></script>
```

### ❌ Absolute paths for assets

Tkeron serves the output from a subdirectory. Absolute paths (`/assets/...`) point to the server root, not to the build subdirectory.

```html
<!-- ❌ BAD — breaks if the site is not at root -->
<link rel="icon" href="/assets/favicon.ico" />
<img src="/assets/logo.webp" />

<!-- ✅ GOOD — relative, works on any host/subdirectory -->
<link rel="icon" href="./assets/favicon.ico" />
<img src="./assets/logo.webp" />
```

Applies to **every `href`, `src` and `url()`** pointing to local assets in `websrc/`.

### ❌ `<link rel="stylesheet">` in HTML

Generates an extra HTTP request, blocks first paint, and bypasses tkeron's per-component dedup and tree-shaking.

```html
<!-- ❌ BAD — extra request, no dedup, no tree-shaking -->
<link rel="stylesheet" href="./styles.css" />

<!-- ✅ GOOD — inlined at build time via a component -->
<global-styles></global-styles>
```

See "CSS via components" above for the `global-styles.com.ts` pattern.

### ❌ Event listeners in `.com.ts`

```typescript
// ❌ BAD — lost in the output, never runs in the browser
com.addEventListener("click", () => console.log("clicked"));

// ✅ GOOD — do it in a browser .ts
// index.ts
document.querySelector(".my-btn")!.addEventListener("click", () => {
  console.log("clicked");
});
```

### ❌ Browser APIs at build time

```typescript
// ❌ BAD — they don't exist in Bun
// In .pre.ts, .post.ts or .com.ts:
window.location.href = "/redirect";
localStorage.setItem("key", "value");
navigator.userAgent;
sessionStorage.getItem("token");

// ✅ GOOD — use them only in browser .ts
```

### ❌ Local state inside `.com.ts`

```typescript
// ❌ BAD — local variables are discarded, no state between instances
let count = 0;
com.innerHTML = `<button>Count: ${count}</button>`;

// ✅ GOOD — state in browser .ts
let count = 0;
document.getElementById("btn")!.addEventListener("click", () => {
  count++;
  document.getElementById("count")!.textContent = String(count);
});
```

### ❌ Accessing `document` from `.com.ts`

```typescript
// ❌ BAD — .com.ts only has access to `com`, not to `document`
const header = document.querySelector("header");

// ✅ GOOD — use .pre.ts or .post.ts for full document access
```

### ❌ Fetch without timeout at build time

```typescript
// ❌ BAD — if the API stalls, the build hangs forever
const data = await fetch("https://slow-api.com/data");

// ✅ GOOD — always with AbortController
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
try {
  const res = await fetch(url, { signal: controller.signal });
  return await res.json();
} catch {
  return fallbackData;
}
```

### ❌ npm packages in the browser

```typescript
// ❌ BAD — tkeron does NOT bundle npm packages for the browser
// index.ts (browser)
import _ from "lodash"; // does not work

// ✅ GOOD — alternatives:
// 1. CDN: <script src="https://cdn.jsdelivr.net/npm/lodash"></script>
// 2. Write vanilla JS
// 3. npm packages DO work in .pre.ts, .post.ts and .com.ts (build time)
```

### ❌ Silent errors

```typescript
// ❌ BAD — the component disappears with no explanation
const data = com.getAttribute("data");
if (!data) {
  com.innerHTML = "";
  return;
}

// ✅ GOOD — fail fast with a clear message
const data = com.getAttribute("data");
if (!data) {
  throw new Error('Attribute "data" is required for data-table component');
}
```

### ❌ Massive repeated inline styles

```typescript
// ❌ BAD — if used 100 times, duplicates KB of CSS
com.innerHTML = `
  <div style="padding: 1rem; margin: 2rem; background: linear-gradient(...);
    border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    ${content}
  </div>
`;

// ✅ GOOD — use CSS classes
com.innerHTML = `<div class="card">${content}</div>`;
```

---

## Security

### Escape dynamic content (XSS prevention)

```typescript
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const text = com.getAttribute("text") || "";
com.innerHTML = `<p>${escapeHtml(text)}</p>`;
```

**Rule**: any attribute, fetch result, or user-provided string injected into HTML via template literal MUST pass through `escapeHtml`. The only exception is intentionally pre-sanitized HTML (e.g. output of a Markdown renderer you trust).

### Validate URLs

```typescript
const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const url = com.getAttribute("href") || "#";
const safeUrl = isSafeUrl(url) ? url : "#";
com.innerHTML = `<a href="${safeUrl}">Link</a>`;
```

### Validate numeric ranges

```typescript
const count = parseInt(com.getAttribute("count") || "5");
if (isNaN(count) || count < 0 || count > 100) {
  throw new Error("Invalid count: must be 0-100");
}
```

---

## Performance

### Build time

- `Promise.all()` for parallel fetch
- Timeout on every external call
- Cache data when possible (write to `/tmp/`)
- Limit data volume (`?limit=10`)

### Output size

- CSS classes instead of repeated inline `style="..."`
- Lean components (little HTML per component)
- CSS lives in `<style>` inside `.com.html` → auto-dedup + tree-shaking
- Global CSS via `<global-styles>` component (inlined), NEVER `<link rel="stylesheet">`
- CSS variables for colors/spacing

---

## AI Agent Checklist

When creating/editing a tkeron project:

1. ✅ HTML scripts: always `.ts` with `type="module"`, NEVER `.js`
2. ✅ Asset paths: always relative (`./`), never absolute (`/`)
3. ✅ Components: ALWAYS with a hyphen, never a standard HTML tag
4. ✅ Browser code → `.ts`. Build code → `.com.ts` / `.pre.ts` / `.post.ts`
5. ✅ Build-time fetch → always with AbortController + timeout
6. ✅ Escape dynamic content (`escapeHtml`)
7. ✅ CSS via components (`<style>` in `.com.html`), never `<link rel="stylesheet">`
8. ✅ **Maximum pre-render**: HTML structure in `.html` / components, JS only fills data
9. ✅ npm packages only at build time, CDN for the browser
10. ✅ `tk build` after every edit, then verify `web/`. NEVER `tk dev` synchronously in agent sessions
11. ✅ `web/` always in `.gitignore` — never edit, never commit
12. ✅ No silent errors — `throw` with a clear message instead
