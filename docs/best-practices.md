# Best Practices

## What Tkeron Does

**Build time:**

- Runs `.pre.ts` - full DOM access, TypeScript, Bun APIs
- Executes `.com.ts` - reads attributes, generates HTML
- Inlines `.com.html` - static replacement
- Compiles TypeScript to JavaScript
- Copies assets

**Runtime (browser):**

- Your compiled JavaScript runs
- Zero framework overhead
- Use any browser APIs

## Component Design

### HTML Components

Static, reusable markup:

```html
<!-- nav-menu.com.html -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

Use for: Headers, footers, layout elements, static UI patterns.

### TypeScript Components

Dynamic generation with attributes:

```typescript
// user-badge.com.ts
const count = com.getAttribute("count") || "3";
const items = [];
for (let i = 1; i <= parseInt(count); i++) {
  items.push(`<li>Item ${i}</li>`);
}
com.innerHTML = `<ul>${items.join("")}</ul>`;
```

Use for: Dynamic lists, conditional rendering, computed HTML.

**Always validate and escape:**

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const text = com.getAttribute("text") || "";
com.innerHTML = `<p>${escapeHtml(text)}</p>`;
```

### Pre-rendering

Build-time DOM manipulation:

```typescript
// index.pre.ts
const res = await fetch("https://api.quotable.io/random");
const data = await res.json();
document.getElementById("quote").textContent = data.content;
```

Use for: API data fetching, SEO meta tags, build metadata.

**Handle errors:**

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch(url, { signal: controller.signal });
  return await res.json();
} catch {
  return fallbackData;
}
```

## File Organization

```
websrc/
├── index.html
├── index.ts
├── index.pre.ts
├── components/
│   ├── header.com.html
│   ├── footer.com.html
│   └── card.com.ts
└── utils/
    └── api.ts
```

Keep it simple. Group related files.

## Naming

**Components:** `user-card.com.html`, `nav-menu.com.ts` (kebab-case, must have hyphen)  
**Files:** `index.html`, `api-service.ts` (lowercase, hyphens)

## Browser Interactivity

Components run at build time. For runtime interactivity, use your `.ts` files:

```typescript
// index.ts - runs in browser
document.getElementById("btn").addEventListener("click", () => {
  console.log("clicked");
});
```

## Build vs Runtime

**Build time (.pre.ts, .com.ts):**

- Runs in Bun
- Has `fetch()`, `Bun.file()`, Node APIs
- Can import npm packages
- No `window`, `localStorage`, etc.

**Runtime (browser):**

- Your compiled `.js` files
- Standard browser environment
- All browser APIs available

## NPM Packages

Tkeron does NOT bundle npm packages for browser.

**Build time:**

```typescript
// .pre.ts - works
import _ from "lodash";
```

**Browser:**

```typescript
// index.ts - won't work without bundler
import _ from "lodash";
```

**Solutions:**

- Use CDN: `<script src="https://cdn.jsdelivr.net/npm/lodash"></script>`
- Use a bundler alongside (Vite, esbuild)
- Write vanilla JavaScript

## Type Checking

Tkeron compiles TypeScript but doesn't type-check.

```bash
tsc --noEmit && tk build
```

## Performance

**Build time:**

- Cache external data when possible
- Use timeouts for API calls
- Parallel requests with `Promise.all()`

**Output size:**

- Keep components lean
- Use CSS classes, not inline styles
- Share styles via external CSS files

## Development Workflow

```bash
tk dev              # Start dev server
# Edit files, browser auto-reloads
tk build            # Build for production
```

## Common Patterns

**Client-side counter:**

```html
<!-- counter.com.html -->
<button id="btn">Count: <span id="count">0</span></button>
```

```typescript
// index.ts
let count = 0;
document.getElementById("btn").addEventListener("click", () => {
  count++;
  document.getElementById("count").textContent = count.toString();
});
```

**Dynamic list component:**

```typescript
// list.com.ts
const items = com.getAttribute("items")?.split(",") || [];
com.innerHTML = `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
```

**Pre-render API data:**

```typescript
// index.pre.ts
const res = await fetch("https://api.github.com/users/tkeron");
const data = await res.json();
document.getElementById("stars").textContent = data.public_repos;
```

## Summary

- HTML components: static markup
- TypeScript components: dynamic generation
- Pre-rendering: DOM manipulation at build time
- Browser code: regular TypeScript/JavaScript
- No bundling of npm packages
- No type checking (use `tsc --noEmit`)
- Powered by Bun
  document.querySelectorAll('.my-button').forEach(btn => {
  btn.addEventListener('click', handleClick);
  });
  });

````

```typescript
// ❌ Don't try to maintain state
let count = 0; // This is meaningless
com.innerHTML = `<button>Count: ${count}</button>`;
````

**Solution:** Use client-side JavaScript for stateful UI.

```typescript
// ❌ Don't access DOM outside 'com'
const header = document.querySelector("header");
com.innerHTML = header?.innerHTML || ""; // Won't work
```

**Solution:** Use pre-rendering for document-wide access.

```typescript
// ❌ Don't use relative imports that won't resolve
import { helper } from "../../../utils"; // May break
```

**Solution:** Use absolute paths or ensure the temp build directory preserves import paths.

### Pre-rendering (.pre.ts)

**Note:** Pre-rendering runs with **Bun runtime** (not Node.js). You have access to Bun APIs like `Bun.version`, `Bun.file()`, etc.

**✅ DO:**

```typescript
// ✅ Fetch data at build time
async function fetchPosts() {
  try {
    const res = await fetch("https://api.example.com/posts");
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    return [];
  }
}

const posts = await fetchPosts();
```

```typescript
// ✅ Inject build metadata
const buildTime = document.getElementById("build-time");
if (buildTime) {
  buildTime.textContent = new Date().toISOString();
}
```

```typescript
// ✅ Conditional content based on environment
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  // Add analytics
  const script = document.createElement("script");
  script.src = "https://analytics.example.com/script.js";
  document.body?.appendChild(script);
}
```

```typescript
// ✅ Generate SEO meta tags
const head = document.querySelector("head");
if (head) {
  const meta = document.createElement("meta");
  meta.setAttribute("property", "og:title");
  meta.setAttribute("content", "My Page Title");
  head.appendChild(meta);
}
```

**❌ DON'T:**

```typescript
// ❌ Don't use browser APIs
window.location.href = "/redirect"; // No 'window'
localStorage.setItem("key", "value"); // No localStorage
navigator.userAgent; // No navigator
```

**Solution:** These APIs don't exist in Node/Bun. Pre-rendering runs server-side.

```typescript
// ❌ Don't try to read runtime user data
const username = document.querySelector("#username-input")?.value;
// This is build-time, no user input exists yet
```

**Solution:** Handle user input in browser with regular JavaScript.

```typescript
// ❌ Don't make blocking requests without timeout
const data = await fetch("https://slow-api.com/data");
// If API is down, build hangs forever
```

**Solution:** Always handle errors and timeouts:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const data = await fetch("https://api.com/data", {
    signal: controller.signal,
  });
  return await data.json();
} catch (error) {
  return fallbackData;
} finally {
  clearTimeout(timeout);
}
```

---

## File Organization

### ✅ Recommended Structure

```
websrc/
├── index.html
├── index.ts
├── index.pre.ts
│
├── styles/
│   ├── main.css
│   └── components.css
│
├── components/
│   ├── ui/
│   │   ├── button.com.html
│   │   ├── card.com.html
│   │   └── badge.com.ts
│   ├── layout/
│   │   ├── header.com.html
│   │   ├── footer.com.html
│   │   └── sidebar.com.html
│   └── shared/
│       ├── icon.com.html
│       └── loading.com.html
│
├── utils/
│   ├── format.ts
│   └── api.ts
│
└── pages/
    ├── about/
    │   ├── about.html
    │   ├── about.ts
    │   └── about.pre.ts
    └── contact/
        ├── contact.html
        └── contact.ts
```

**Benefits:**

- Components are organized by purpose
- Related files are grouped together
- Easy to find and maintain

### ❌ Anti-Patterns

```
websrc/
├── component1.com.html
├── component2.com.html
├── component3.com.ts
├── thing.com.html
├── test.com.html
├── temp.com.html
└── stuff.ts
```

**Problems:**

- No organization
- Unclear purpose
- Hard to maintain
- Poor naming

---

## Naming Conventions

### Component Names

**✅ DO:**

```
user-profile.com.html      → <user-profile>
nav-menu-item.com.html     → <nav-menu-item>
blog-post-card.com.ts      → <blog-post-card>
social-share-button.com.ts → <social-share-button>
```

**Rules:**

- Lowercase with hyphens (kebab-case)
- Descriptive and specific
- Follows custom element naming (must have hyphen)

**❌ DON'T:**

```
UserProfile.com.html   → Use lowercase
component.com.html     → Too generic
btn.com.html          → Too abbreviated
thing1.com.html       → Meaningless
user.com.html         → No hyphen (invalid custom element)
```

### File Names

**✅ DO:**

```
index.html, index.ts, index.pre.ts
about.html, about.ts
blog-post.html, blog-post.pre.ts
api-service.ts
format-utils.ts
```

**❌ DON'T:**

```
Index.html          → Use lowercase
About Page.html     → No spaces
blog_post.html      → Use hyphens, not underscores
temp.html          → Not descriptive
test123.html       → Meaningless
```

---

## Performance

### Build Time

**✅ DO:**

```typescript
// ✅ Cache external data
import { readFileSync, writeFileSync, existsSync } from "fs";

const cacheFile = "/tmp/api-cache.json";
const cacheMaxAge = 3600000; // 1 hour

async function getCachedData() {
  if (existsSync(cacheFile)) {
    const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
    if (Date.now() - cache.timestamp < cacheMaxAge) {
      return cache.data;
    }
  }

  const data = await fetch("https://api.example.com/data");
  const json = await data.json();

  writeFileSync(
    cacheFile,
    JSON.stringify({
      timestamp: Date.now(),
      data: json,
    }),
  );

  return json;
}
```

```typescript
// ✅ Limit API calls
const posts = await fetch("https://api.example.com/posts?limit=10");
// Don't fetch all 10,000 posts at build time
```

```typescript
// ✅ Parallel processing when possible
const [posts, authors, tags] = await Promise.all([
  fetch("https://api.example.com/posts").then((r) => r.json()),
  fetch("https://api.example.com/authors").then((r) => r.json()),
  fetch("https://api.example.com/tags").then((r) => r.json()),
]);
```

**❌ DON'T:**

```typescript
// ❌ Sequential API calls
const posts = await fetch("/api/posts").then((r) => r.json());
const authors = await fetch("/api/authors").then((r) => r.json());
const tags = await fetch("/api/tags").then((r) => r.json());
// Use Promise.all instead
```

```typescript
// ❌ Large data fetching
const allUsers = await fetch("/api/users?limit=100000");
// This makes builds slow and outputs huge HTML
```

### Output Size

**✅ DO:**

```typescript
// ✅ Keep components lean
com.innerHTML = `
  <div class="card">
    <h3>${title}</h3>
  </div>
`;
```

```html
<!-- ✅ Share styles via CSS -->
<!-- Don't inline repeated styles in every component -->
<link rel="stylesheet" href="/styles/components.css" />
```

**❌ DON'T:**

```typescript
// ❌ Huge inline styles in every instance
com.innerHTML = `
  <div style="padding: 1rem; margin: 2rem; background: linear-gradient(...); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
    ${content}
  </div>
`;
// If used 100 times, this duplicates megabytes of CSS
```

**Solution:**

```typescript
// Use CSS classes
com.innerHTML = `<div class="card">${content}</div>`;
```

```css
/* styles/components.css */
.card {
  padding: 1rem;
  margin: 2rem;
  background: linear-gradient(...);
  /* ... */
}
```

---

## Security

### XSS Prevention

**✅ DO:**

```typescript
// ✅ Escape HTML in user content
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const userComment = com.getAttribute("comment") || "";
com.innerHTML = `<p>${escapeHtml(userComment)}</p>`;
```

```typescript
// ✅ Sanitize URLs
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const url = com.getAttribute("href") || "#";
const safeUrl = isSafeUrl(url) ? url : "#";
com.innerHTML = `<a href="${safeUrl}">Link</a>`;
```

**❌ DON'T:**

```typescript
// ❌ Raw user input
const userInput = com.getAttribute("text") || "";
com.innerHTML = userInput; // XSS vulnerability!
```

```typescript
// ❌ Unvalidated URLs
const url = com.getAttribute("href") || "";
com.innerHTML = `<a href="${url}">Link</a>`;
// Can be exploited: <my-link href="javascript:alert('xss')">
```

### Data Validation

**✅ DO:**

```typescript
// ✅ Validate and sanitize
const count = parseInt(com.getAttribute("count") || "5");
if (isNaN(count) || count < 0 || count > 100) {
  throw new Error("Invalid count: must be 0-100");
}
```

```typescript
// ✅ Whitelist allowed values
const validTypes = ["info", "warning", "error", "success"];
const type = com.getAttribute("type") || "info";

if (!validTypes.includes(type)) {
  throw new Error(`Invalid type. Allowed: ${validTypes.join(", ")}`);
}
```

---

## Error Handling

### Component Errors

**✅ DO:**

```typescript
// ✅ Fail fast with clear messages
const required = com.getAttribute("data");
if (!required) {
  throw new Error('Attribute "data" is required for data-table component');
}
```

```typescript
// ✅ Provide context
try {
  const data = JSON.parse(com.getAttribute("json") || "{}");
} catch (error) {
  throw new Error(
    `Failed to parse JSON in component. ` +
      `Attribute value: ${com.getAttribute("json")}`,
  );
}
```

**❌ DON'T:**

```typescript
// ❌ Silent failures
const data = com.getAttribute("data");
if (!data) {
  com.innerHTML = ""; // Component just disappears, unclear why
  return;
}
```

```typescript
// ❌ Generic errors
throw new Error("Something went wrong"); // Not helpful
```

### Pre-rendering Errors

**✅ DO:**

```typescript
// ✅ Graceful degradation
async function fetchData() {
  try {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("API fetch failed, using fallback:", error);
    return { items: [] }; // Fallback data
  }
}
```

```typescript
// ✅ Timeouts for external calls
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  return await response.json();
} catch (error) {
  console.error("Request timeout or failed");
  return fallbackData;
}
```

---

## Testing

### Component Testing

**✅ DO:**

```typescript
// ✅ Test components in isolation
// test-component.html
<!DOCTYPE html>
<html>
<body>
  <user-card name="Test User" role="Admin"></user-card>
</body>
</html>
```

```bash
tk build
# Check output:
cat web/test-component.html
```

### Build Testing

**✅ DO:**

```bash
# ✅ Test build in CI
tk build
if [ $? -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

# Verify output
test -f web/index.html || exit 1
test -f web/index.js || exit 1
```

---

## Common Patterns

### Client-Side Interactivity

Components generate HTML at build time. For runtime interactivity, use your regular `.ts` files:

**Static button component:**

```html
<!-- button-counter.com.html -->
<button class="counter-button" data-count="0">
  Count: <span class="count">0</span>
</button>
```

**Add interactivity in browser:**

```typescript
// index.ts - runs in browser
document.querySelectorAll(".counter-button").forEach((btn) => {
  let count = 0;
  btn.addEventListener("click", () => {
    count++;
    const span = btn.querySelector(".count");
    if (span) span.textContent = count.toString();
  });
});
```

This pattern keeps your components simple and your interactivity explicit.

### Component Depth

Keep component nesting reasonable (2-3 levels max):

```
✅ Good:
page.html → header.com.html → logo.com.html

❌ Deep nesting (harder to debug):
page → layout → section → card → header → icon → svg (7 levels!)
```

### Type Safety in Components

```typescript
// user-badge.com.ts
const value = com.getAttribute("value") || "0";
const num = parseInt(value, 10);

if (isNaN(num)) {
  throw new Error(`Invalid value: ${value}`);
}

com.innerHTML = `<span>${num}</span>`;
```

### Escaping User Content

Always escape dynamic content to prevent XSS:

```typescript
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const text = com.getAttribute("text") || "";
com.innerHTML = `<p>${escapeHtml(text)}</p>`;
```

---

## Development Workflow

### Recommended Flow

```bash
# 1. Start dev server
tk dev

# 2. Edit files
# - Components update automatically
# - Browser reloads on change

# 3. Test changes
# - View in browser
# - Check console for errors

# 4. Build for production
NODE_ENV=production tk build

# 5. Test build output
cd web && python -m http.server 8000

# 6. Deploy
rsync -avz web/ server:/var/www/html/
```

### Hot Reload Tips

- Save files to trigger rebuild
- Watch terminal for build errors
- Clear browser cache if styles don't update
- Check browser console for runtime errors

---

## What Tkeron Does and Doesn't Do

### Build-Time vs Runtime

**Build time (.pre.ts, .com.ts):**

- Runs in Bun runtime (not browser)
- Full TypeScript support
- Can use `fetch()`, `Bun.file()`, Node APIs
- Can import npm packages (available during build)
- Manipulate DOM with full access to `document`

**Runtime (browser):**

- Your compiled `.js` files run
- Standard browser environment
- Use any browser APIs, libraries, patterns
- No framework overhead from Tkeron

### NPM Packages

Tkeron **does NOT bundle** npm packages into browser code.

```typescript
// .pre.ts or .com.ts - Build time
import _ from "lodash"; // ✅ Works - runs in Bun during build
const result = _.chunk([1, 2, 3], 2);
```

```typescript
// index.ts - Browser runtime
import _ from "lodash"; // ❌ Won't work - not bundled
```

**Solutions:**

- Use CDN: `<script src="https://cdn.jsdelivr.net/npm/lodash"></script>`
- Use a bundler alongside Tkeron (Vite, esbuild, etc.)
- Write vanilla JavaScript (often simpler than you think)

### Type Checking

Tkeron compiles TypeScript but **does NOT** type-check:

```typescript
const x: number = "string"; // Compiles anyway
```

**Solution:** Run `tsc --noEmit` separately:

```bash
tsc --noEmit && tk build
```

Or add to your build script:

```json
{
  "scripts": {
    "build": "tsc --noEmit && tk build"
  }
}
```

---

## Quick Wins

### 1. Use Examples as Templates

Copy from `examples/` directory:

```bash
cp -r node_modules/tkeron/examples/init_sample websrc
```

### 2. Add Type Definitions

Include `tkeron.d.ts` for autocomplete:

```typescript
/// <reference path="./tkeron.d.ts" />
```

### 3. Use CSS Variables

Share colors and spacing:

```css
:root {
  --primary: #3b82f6;
  --spacing: 1rem;
}

.card {
  padding: var(--spacing);
  color: var(--primary);
}
```

### 4. Organize by Feature

Group related files:

```
websrc/features/
  blog/
    blog-card.com.html
    blog-list.com.ts
    blog.html
```

### 5. Environment-Based Builds

```typescript
// index.pre.ts
const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  // Development-only code
}
```

---

## Next Steps

- Return to [**Overview**](./overview.md)
- Review [**CLI Reference**](./cli-reference.md)
- Explore [**Components**](./components-html.md)
- Learn [**Pre-rendering**](./pre-rendering.md)
