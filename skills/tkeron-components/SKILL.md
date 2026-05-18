---
name: tkeron-components
description: "Deep dive into tkeron components and build-time scripts: .com.html, .com.ts, .com.md, .pre.ts, .post.ts — the com/document globals, attribute reading, resolution priority, nesting, the wrapper-disappears rule, and full-cycle examples. Use this skill when creating, editing, or debugging any tkeron component or pre/post-rendering script."
---

# Tkeron — Components and Pre/Post-rendering

## The 4 Component Types

### 1. `.com.html` — Static HTML Component

Plain markup. Inlined in place. No logic, no attributes, no variables.

```html
<!-- site-header.com.html -->
<header class="site-header">
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

```html
<!-- In any .html -->
<site-header></site-header>
```

**Output**: `<site-header>` is replaced with the content of the `.com.html`.

**Can have multiple root elements:**

```html
<!-- two-columns.com.html -->
<div class="col">Column 1</div>
<div class="col">Column 2</div>
```

**Limitations**:

- ❌ Cannot read attributes (`{title}` does not work)
- ❌ No conditional logic
- ❌ No slots or Shadow DOM
- ❌ Cannot include itself (circular)

**When to use**: headers, footers, navs, static cards, SVG icons, fixed layouts.

---

### 2. `.com.ts` — Dynamic TypeScript Component

Runs in **Bun** during the build. Has the `com` variable (the custom element in the DOM). Only `com.innerHTML` is preserved in the output.

```typescript
// user-badge.com.ts
const name = com.getAttribute("name") || "Guest";
const role = com.getAttribute("role") || "User";

com.innerHTML = `
  <div class="badge">
    <span>${name}</span>
    <span>${role}</span>
  </div>
`;
```

```html
<user-badge name="Alice" role="Admin"></user-badge>
<user-badge name="Bob"></user-badge>
```

**The `com` variable** (HTMLElement):

```typescript
com.getAttribute("attr")   // Read an attribute
com.innerHTML = "..."      // ONLY preserved effect → defines the output
com.tagName                // Element name
com.querySelector(...)     // Search inside (when innerHTML is already set)
```

**Can import modules:**

```typescript
// product-card.com.ts
import { formatPrice } from "./utils/format.js";

const price = parseFloat(com.getAttribute("price") || "0");
com.innerHTML = `<p>${formatPrice(price)}</p>`;
```

**Can fetch:**

```typescript
// weather-card.com.ts
const city = com.getAttribute("city") || "Madrid";
const res = await fetch(`https://api.weather.com?city=${city}`);
const data = await res.json();
com.innerHTML = `<div>${data.temp}°C in ${city}</div>`;
```

**Can use npm packages** (installed with `bun add`):

```typescript
// code-block.com.ts
import { codeToHtml } from "shiki";
const code = com.getAttribute("code") || "";
const html = await codeToHtml(code, {
  lang: "typescript",
  theme: "github-dark",
});
com.innerHTML = `<div class="code-block">${html}</div>`;
```

**Full TypeScript**: interfaces, types, async/await, for/if, everything works.

**Limitations**:

- ❌ Event listeners are lost (only static HTML in output)
- ❌ No access to global `document` (only `com`)
- ❌ No `window`, `localStorage`, `navigator`
- ❌ No state between instances
- ❌ Local variables are discarded after the file runs

---

### 3. `.com.md` — Markdown Component

Markdown (full GFM) → HTML. Inlined just like `.com.html`.

```markdown
<!-- hero-text.com.md -->

# Welcome

This is an **amazing site**.

- Fast
- Simple
- Powerful
```

```html
<hero-text></hero-text>
```

**Supports full GFM**: headings, bold, italic, strikethrough, lists, tables, blockquotes, code blocks, links, images.

**Can contain custom elements** inside the Markdown (processed on the next iteration):

```markdown
<!-- page-content.com.md -->

# Content

Introductory text.

<feature-list></feature-list>

Final text.
```

**Limitations**:

- ❌ Cannot read attributes (static, like `.com.html`)
- ❌ No logic

**When to use**: text sections, FAQs, about, docs, rich content.

---

### 4. `.com.ts` + `.com.html` — Template + Logic

When BOTH `name.com.html` and `name.com.ts` exist for the same component name, the `.com.html` is loaded as `com.innerHTML` **before** the `.com.ts` runs. This separates structure from logic.

**Template** (`user-card.com.html`):

```html
<div class="card">
  <h3 class="name"></h3>
  <p class="role"></p>
</div>
```

**Logic** (`user-card.com.ts`):

```typescript
const name = com.getAttribute("data-name") || "Unknown";
const role = com.getAttribute("data-role") || "N/A";

const nameEl = com.querySelector(".name");
const roleEl = com.querySelector(".role");
if (nameEl) nameEl.textContent = name;
if (roleEl) roleEl.textContent = `Role: ${role}`;
```

**Usage:**

```html
<user-card data-name="Alice" data-role="Developer"></user-card>
```

The `.com.ts` can read, mutate, or completely replace the template.

---

## Build-time Scripts

In addition to components, tkeron has two "page-level" build-time scripts that operate on the full DOM of a paired `.html`:

### `.pre.ts` — Pre-rendering (runs BEFORE components)

Runs in **Bun** at the **very start** of the build. Has `document` (the full DOM of the paired `.html`). Manipulates the whole document **before** any component is resolved.

**Automatic pairing**: `index.pre.ts` → `index.html`. `about.pre.ts` → `about.html`.

> **If the `.html` does not exist**, tkeron creates a base one automatically.

```typescript
// index.pre.ts
import { fetchPosts } from "./api-service.js";

const title = document.querySelector("title");
if (title) title.textContent = "My Site";

const head = document.querySelector("head");
if (head) {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "description");
  meta.setAttribute("content", "Site description");
  head.appendChild(meta);
}

const posts = await fetchPosts();
const container = document.getElementById("posts");
if (container) {
  container.innerHTML = posts
    .map((p) => `<article><h2>${p.title}</h2></article>`)
    .join("");
}
```

**Inject components dynamically** (they will be processed by the component loop afterwards):

```typescript
// dashboard.pre.ts
const isDev = process.env.NODE_ENV === "development";
const body = document.querySelector("body");
if (body && isDev) {
  const panel = document.createElement("debug-panel");
  body.appendChild(panel);
}
```

**Use cases**: SEO meta tags, dynamic `<title>`, fetch data at build time, conditionally insert custom elements that the component loop will then resolve.

### `.post.ts` — Post-processing (runs AFTER components)

Runs in **Bun** at the **very end** of the build, **after** all components (`.com.html`, `.com.ts`, `.com.md`) have been inlined. Has `document` (the full DOM of the paired `.html`, with components already resolved). Last chance to mutate the page before it is written to `web/`.

**Automatic pairing**: `index.post.ts` → `index.html`. `about.post.ts` → `about.html`.

```typescript
// index.post.ts
// At this point all <site-header>, <user-card>, etc. have been replaced
// with their final HTML. The DOM is ready for post-processing.

const links = document.querySelectorAll("a[href^='http']");
for (const link of links) {
  link.setAttribute("rel", "noopener noreferrer");
  link.setAttribute("target", "_blank");
}

const images = document.querySelectorAll("img:not([loading])");
for (const img of images) {
  img.setAttribute("loading", "lazy");
}

const headings = document.querySelectorAll("h2, h3");
for (const h of headings) {
  if (!h.id && h.textContent) {
    h.setAttribute("id", h.textContent.toLowerCase().replace(/\s+/g, "-"));
  }
}
```

**Use cases**:

- Add `rel="noopener"` / `target="_blank"` to external links
- Add `loading="lazy"` to images that don't have it
- Auto-generate `id`s on headings for anchor links
- Build a Table of Contents from the resolved DOM
- Sanitize / rewrite attributes
- Final HTML transformations that depend on the **fully assembled** page

**Variables and limits**: identical to `.pre.ts` (`document`, full Bun runtime, no `window`/`localStorage`).

### `.pre.ts` vs `.post.ts` — When to use which

| Concern                                       | `.pre.ts`                       | `.post.ts`            |
| --------------------------------------------- | ------------------------------- | --------------------- |
| Inject custom elements that must be processed | ✅ (loop runs after)            | ❌ (loop already ran) |
| Set `<title>` / `<meta>`                      | ✅                              | ✅                    |
| Fetch data and seed page content              | ✅                              | ✅                    |
| Walk the final, fully-resolved DOM            | ❌                              | ✅                    |
| Rewrite links/images in components            | ❌ (components not yet inlined) | ✅                    |
| Generate TOC from real headings               | ❌                              | ✅                    |

**Rule of thumb**: if you need to insert custom elements → `.pre.ts`. If you need to read the final HTML of components → `.post.ts`.

---

## Naming — Mandatory Rules

Every component **must have a hyphen** in its name (HTML custom-elements standard):

| File                    | Element            | Valid?               |
| ----------------------- | ------------------ | -------------------- |
| `user-card.com.html`    | `<user-card>`      | ✅                   |
| `nav-menu.com.ts`       | `<nav-menu>`       | ✅                   |
| `blog-post-card.com.ts` | `<blog-post-card>` | ✅                   |
| `card.com.html`         | `<card>`           | ❌ no hyphen         |
| `header.com.html`       | `<header>`         | ❌ standard HTML tag |
| `UserCard.com.html`     | `<user-card>`      | ✅ case-insensitive  |

**Format**: kebab-case, lowercase with hyphens.

---

## Component Resolution

Tkeron looks up components in this order:

1. **Same directory** as the file that uses it (high priority — local override)
2. **Any directory** under `websrc/` (glob search)

```
websrc/
├── index.html              # <blog-card> → components/blog-card.com.html
├── components/
│   └── blog-card.com.html  # Global component
└── blog/
    ├── post.html           # <blog-card> → blog/blog-card.com.html (local wins)
    └── blog-card.com.html  # Local override for blog/
```

### Priority between types

When multiple file types exist for the same name:

1. **`.com.ts`** — highest priority
2. **`.com.html`** — second
3. **`.com.md`** — lowest

(Exception: if `.com.html` and `.com.ts` share a name, the HTML is loaded as `com.innerHTML` and the `.com.ts` runs on top of it — see "Template + Logic" above.)

---

## Iteration and Nesting

Tkeron processes components in an **iterative loop (max 10 cycles)** until no more changes are detected. This enables:

### Components that use other components

```html
<!-- user-card.com.html -->
<div class="user-card">
  <user-avatar></user-avatar>
  <div class="info">John Doe</div>
</div>
```

```html
<!-- user-avatar.com.html -->
<div class="avatar">
  <img src="./avatars/default.jpg" alt="User" />
</div>
```

Build: `<user-card>` is replaced → contains `<user-avatar>` → replaced on the next iteration.

### `.com.ts` that emits custom elements

```typescript
// user-profile.com.ts
const username = com.getAttribute("username") || "anon";
com.innerHTML = `
  <div class="profile">
    <user-avatar username="${username}"></user-avatar>
    <span>${username}</span>
  </div>
`;
// <user-avatar> will be processed on the next iteration
```

### `.pre.ts` that injects components

```typescript
// index.pre.ts
const body = document.querySelector("body");
if (body) {
  const nav = document.createElement("site-nav");
  body.insertBefore(nav, body.firstChild);
}
// <site-nav> will be processed by the component loop
```

### Limits

- **Max 10 iterations** of the component loop
- **Max 50 levels** of nesting depth
- **No circular dependencies** (A uses B uses A → error)

---

## Interactivity: Build Time + Runtime

Components emit static HTML. For interactivity, use a browser `.ts` file:

**Static component:**

```html
<!-- counter-btn.com.html -->
<button id="counter-btn">Clicks: <span id="count">0</span></button>
```

**Browser interactivity:**

```typescript
// index.ts (runtime, browser)
const btn = document.getElementById("counter-btn")!;
const count = document.getElementById("count")!;
let n = 0;
btn.addEventListener("click", () => {
  n++;
  count.textContent = String(n);
});
```

---

## Build in Action — Real Input and Output

### Example 1: `.com.html` — direct replacement

**Source `websrc/`:**

```
websrc/
├── index.html
└── site-header.com.html
```

```html
<!-- websrc/site-header.com.html -->
<header class="site-header">
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

```html
<!-- websrc/index.html (BEFORE build) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Site</title>
  </head>
  <body>
    <site-header></site-header>
    <main><p>Content</p></main>
    <script type="module" src="index.ts"></script>
  </body>
</html>
```

**Output `web/` after `tk build`:**

```html
<!-- web/index.html (AFTER build) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Site</title>
  </head>
  <body>
    <header class="site-header">
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
    <main><p>Content</p></main>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

Note: `<site-header>` was replaced with the component HTML. `index.ts` was compiled and the reference rewritten to `index.js`. `site-header.com.html` does not exist in `web/`.

### Example 2: `.com.ts` — dynamic component with attributes

**Source `websrc/`:**

```
websrc/
├── index.html
└── user-badge.com.ts
```

```typescript
// websrc/user-badge.com.ts
const name = com.getAttribute("name") || "Guest";
const role = com.getAttribute("role") || "User";

com.innerHTML = `
  <div class="badge">
    <span class="badge-name">${name}</span>
    <span class="badge-role">${role}</span>
  </div>
`;
```

```html
<!-- websrc/index.html (BEFORE build) -->
<body>
  <user-badge name="Alice" role="Admin"></user-badge>
  <user-badge name="Bob"></user-badge>
  <user-badge></user-badge>
</body>
```

**Output `web/index.html`:**

```html
<body>
  <div class="badge">
    <span class="badge-name">Alice</span>
    <span class="badge-role">Admin</span>
  </div>
  <div class="badge">
    <span class="badge-name">Bob</span>
    <span class="badge-role">User</span>
  </div>
  <div class="badge">
    <span class="badge-name">Guest</span>
    <span class="badge-role">User</span>
  </div>
</body>
```

Each `<user-badge>` instance is replaced with the `com.innerHTML` generated for that specific instance (with its own attributes).

### Example 3: `.pre.ts` — document transformation

**Source `websrc/`:**

```
websrc/
├── index.html
└── index.pre.ts
```

```html
<!-- websrc/index.html (BEFORE build) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Document</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p id="build-time"></p>
    <ul id="posts"></ul>
  </body>
</html>
```

```typescript
// websrc/index.pre.ts
const title = document.querySelector("title");
if (title) title.textContent = "My Blog";

const head = document.querySelector("head");
if (head) {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "description");
  meta.setAttribute("content", "My personal site");
  head.appendChild(meta);
}

const buildTime = document.getElementById("build-time");
if (buildTime) buildTime.textContent = "Build: 2026-03-03";

const posts = document.getElementById("posts");
if (posts) {
  posts.innerHTML = `
    <li><a href="/post-1">Post 1</a></li>
    <li><a href="/post-2">Post 2</a></li>
  `;
}
```

**Output `web/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Blog</title>
    <meta name="description" content="My personal site" />
  </head>
  <body>
    <h1>Welcome</h1>
    <p id="build-time">Build: 2026-03-03</p>
    <ul id="posts">
      <li><a href="/post-1">Post 1</a></li>
      <li><a href="/post-2">Post 2</a></li>
    </ul>
  </body>
</html>
```

The `.pre.ts` file does not appear in `web/`. The HTML was mutated in memory during the build.

### Example 4: `.post.ts` — final DOM walk

**Source `websrc/`:**

```
websrc/
├── index.html
├── external-link.com.html
└── index.post.ts
```

```html
<!-- websrc/external-link.com.html -->
<a href="https://example.com">Example</a>
```

```html
<!-- websrc/index.html (BEFORE build) -->
<body>
  <h2>Resources</h2>
  <external-link></external-link>
  <img src="./photo.jpg" alt="photo" />
</body>
```

```typescript
// websrc/index.post.ts
// Runs AFTER <external-link> has already been replaced
// by its <a href="https://example.com">...</a>

const links = document.querySelectorAll("a[href^='http']");
for (const link of links) {
  link.setAttribute("rel", "noopener noreferrer");
  link.setAttribute("target", "_blank");
}

const images = document.querySelectorAll("img:not([loading])");
for (const img of images) {
  img.setAttribute("loading", "lazy");
}

const headings = document.querySelectorAll("h2");
for (const h of headings) {
  if (!h.id && h.textContent) {
    h.setAttribute("id", h.textContent.toLowerCase().replace(/\s+/g, "-"));
  }
}
```

**Output `web/index.html`:**

```html
<body>
  <h2 id="resources">Resources</h2>
  <a href="https://example.com" rel="noopener noreferrer" target="_blank">
    Example
  </a>
  <img src="./photo.jpg" alt="photo" loading="lazy" />
</body>
```

The `<external-link>` was inlined first, then `.post.ts` walked the resolved DOM and added `rel`, `target`, `loading` and `id` attributes.

### Example 5: Full cycle (`.pre.ts` + components + `.post.ts`)

**Source:**

```
websrc/
├── index.html
├── index.pre.ts
├── index.post.ts
├── site-footer.com.html
└── alert-box.com.ts
```

```html
<!-- websrc/site-footer.com.html -->
<footer><p>&copy; 2026 My Site</p></footer>
```

```typescript
// websrc/alert-box.com.ts
const type = com.getAttribute("type") || "info";
const msg = com.getAttribute("msg") || "";
com.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
```

```html
<!-- websrc/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>App</title>
  </head>
  <body>
    <alert-box type="success" msg="Welcome"></alert-box>
    <main><p>Content</p></main>
    <site-footer></site-footer>
  </body>
</html>
```

```typescript
// websrc/index.pre.ts
const title = document.querySelector("title");
if (title) title.textContent = "App — Home";
```

```typescript
// websrc/index.post.ts
const main = document.querySelector("main");
if (main) main.setAttribute("data-section", "home");
```

**Output `web/index.html`:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>App — Home</title>
  </head>
  <body>
    <div class="alert alert-success">Welcome</div>
    <main data-section="home"><p>Content</p></main>
    <footer><p>&copy; 2026 My Site</p></footer>
  </body>
</html>
```

**`web/` contains only:**

```
web/
└── index.html
```

**Files that disappear from the output**: `index.pre.ts`, `index.post.ts`, `alert-box.com.ts`, `site-footer.com.html`.

---

## When to Use Each Type

| I need to...                                          | Use...                  |
| ----------------------------------------------------- | ----------------------- |
| Reusable markup with no logic                         | `.com.html`             |
| Dynamic HTML driven by attributes                     | `.com.ts`               |
| Formatted text in Markdown                            | `.com.md`               |
| Mutate the document BEFORE components run             | `.pre.ts`               |
| Mutate the document AFTER components are resolved     | `.post.ts`              |
| SEO meta tags, page title                             | `.pre.ts` or `.post.ts` |
| Fetch API at build time and seed content              | `.pre.ts` or `.com.ts`  |
| Inject custom elements conditionally                  | `.pre.ts`               |
| Add `rel="noopener"` / `loading="lazy"` to final HTML | `.post.ts`              |
| Auto-generate heading ids / table of contents         | `.post.ts`              |
| Separate template from logic                          | `.com.html` + `.com.ts` |
| Interactivity, events, user input                     | `.ts` (browser)         |
| State, localStorage, animations                       | `.ts` (browser)         |
