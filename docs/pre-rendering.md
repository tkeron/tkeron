# Pre-rendering

Pre-rendering (`.pre.ts` files) allows you to transform HTML documents at build time. Unlike components that target specific elements, pre-rendering gives you full access to the entire document.

## Quick Start

Create a `.pre.ts` file with the same base name as your `.html` file:

```typescript
// index.pre.ts
const title = document.querySelector("title");
if (title) {
  title.textContent = "My Awesome Site";
}
```

The corresponding `index.html` is automatically loaded and modified:

```html
<!-- index.html - before -->
<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
  <body></body>
</html>
```

After build:

```html
<!-- index.html - after -->
<!DOCTYPE html>
<html>
  <head>
    <title>My Awesome Site</title>
  </head>
  <body></body>
</html>
```

## How It Works

### File Pairing

Pre-rendering files are paired with HTML files:

| Pre-render File    | Processes        |
| ------------------ | ---------------- |
| `index.pre.ts`     | `index.html`     |
| `about.pre.ts`     | `about.html`     |
| `blog/post.pre.ts` | `blog/post.html` |

### The `document` Variable

Every `.pre.ts` file has access to a special `document` variable:

```typescript
// Access the full DOM
document.querySelector("h1");
document.getElementById("content");
document.querySelectorAll(".items");
document.body;
document.documentElement;
```

This is the parsed DOM from the corresponding `.html` file.

### Build Process Order

```
1. Run .pre.ts files    → Modify HTML documents
2. Iterative component processing (up to 10 iterations):
   a. Process .com.ts   → Replace TypeScript components
   b. Process .com.html → Replace HTML components
   c. Process .com.md   → Replace Markdown components
   d. Repeat until no changes
3. Compile .ts to .js   → TypeScript compilation
4. Copy to output       → Final build
```

Pre-rendering happens **first**, so you can inject components dynamically.

### Auto-Create HTML

If the `.html` file doesn't exist, Tkeron creates a default one:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body></body>
</html>
```

Then your `.pre.ts` file runs on this template.

### IDE Support & IntelliSense

The `tkeron.d.ts` file in your project provides type definitions for the `document` variable:

```typescript
declare module "*.pre.ts" {
  global {
    const document: Document;
  }
}
```

This enables:

- **IntelliSense** for `document.querySelector()`, `document.getElementById()`, etc.
- **Type checking** for DOM manipulation
- **Auto-completion** for all Document methods and properties

The `tsconfig.json` ensures your IDE recognizes these types. Both files are automatically created by `tk init`.

## Basic Examples

### Set Page Title

```typescript
// index.pre.ts
const title = document.querySelector("title");
if (title) {
  title.textContent = "Welcome to My Site";
}
```

### Inject Meta Tags

```typescript
// index.pre.ts
const head = document.querySelector("head");

if (head) {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "description");
  meta.setAttribute("content", "A description of my site");
  head.appendChild(meta);
}
```

### Add Content to Body

```typescript
// index.pre.ts
const body = document.querySelector("body");

if (body) {
  const header = document.createElement("header");
  header.innerHTML = "<h1>Welcome!</h1>";
  body.insertBefore(header, body.firstChild);
}
```

### Inject Build Time

```typescript
// index.pre.ts
const buildTimeElement = document.getElementById("build-time");

if (buildTimeElement) {
  const now = new Date();
  buildTimeElement.textContent = `Built: ${now.toLocaleString()}`;
}
```

**HTML:**

```html
<p id="build-time"></p>
```

**Output:**

```html
<p id="build-time">Built: 12/28/2025, 3:45:23 PM</p>
```

## Advanced Features

### Full TypeScript Support

Use all TypeScript features:

```typescript
// blog.pre.ts
interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
}

const posts: BlogPost[] = [
  { title: "First Post", date: "2025-01-01", excerpt: "This is my first post" },
  { title: "Second Post", date: "2025-01-15", excerpt: "Another great post" },
];

const container = document.getElementById("blog-posts");

if (container) {
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <h2>${post.title}</h2>
      <time>${post.date}</time>
      <p>${post.excerpt}</p>
    `;
    container.appendChild(article);
  });
}
```

### Import External Modules

```typescript
// index.pre.ts
import { getBuildMetadata } from "./build-utils";

const metadata = await getBuildMetadata();

const footer = document.querySelector("footer");
if (footer) {
  footer.innerHTML = `
    <p>Built: ${metadata.timestamp}</p>
    <p>Version: ${metadata.version}</p>
  `;
}
```

```typescript
// build-utils.ts
export async function getBuildMetadata() {
  return {
    timestamp: new Date().toISOString(),
    version: process.env.TKERON_VERSION || "unknown",
  };
}
```

### Fetch External Data

Fetch data from APIs at build time:

```typescript
// products.pre.ts
interface Product {
  id: number;
  name: string;
  price: number;
}

async function getProducts(): Promise<Product[]> {
  const response = await fetch("https://api.example.com/products");
  return response.json();
}

const products = await getProducts();
const container = document.getElementById("products");

if (container) {
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
    `;
    container.appendChild(card);
  });
}
```

**Note:** Data is fetched **once at build time**. The output is static HTML with the data baked in.

### Use npm Packages

```typescript
// blog-post.pre.ts
import { marked } from "marked";
import { readFileSync } from "fs";
import { join } from "path";

const markdownPath = join(import.meta.dir, "post-content.md");
const markdown = readFileSync(markdownPath, "utf-8");
const html = marked(markdown);

const article = document.querySelector("article");
if (article) {
  article.innerHTML = html;
}
```

Install the package:

```bash
bun add marked
```

### Environment Variables

Access environment variables:

```typescript
// index.pre.ts
const version = process.env.TKERON_VERSION;
const nodeEnv = process.env.NODE_ENV || "development";

const versionElement = document.getElementById("version");
if (versionElement) {
  versionElement.textContent = `v${version} (${nodeEnv})`;
}
```

### Bun Runtime APIs

```typescript
// index.pre.ts
const buildInfo = document.getElementById("build-info");

if (buildInfo) {
  buildInfo.innerHTML = `
    <p>Built with Bun ${Bun.version}</p>
    <p>Platform: ${process.platform}</p>
    <p>Arch: ${process.arch}</p>
  `;
}
```

### Dynamic Component Injection

Inject components based on logic:

```typescript
// dashboard.pre.ts
const isDevelopment = process.env.NODE_ENV === "development";
const body = document.querySelector("body");

if (body && isDevelopment) {
  const debugPanel = document.createElement("debug-panel");
  body.appendChild(debugPanel);
}
```

The `<debug-panel>` component will be processed in the next build step.

## Practical Examples

### Blog Post List from API

```typescript
// blog.pre.ts
interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch("https://api.example.com/posts");
    return response.json();
  } catch (error) {
    console.warn("Failed to fetch posts, using fallback");
    return [];
  }
}

const posts = await getPosts();
const blogList = document.getElementById("blog-list");

if (blogList) {
  if (posts.length === 0) {
    blogList.innerHTML = "<p>No posts available</p>";
  } else {
    posts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "blog-preview";
      article.innerHTML = `
        <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
        <time>${new Date(post.date).toLocaleDateString()}</time>
        <p>${post.excerpt}</p>
      `;
      blogList.appendChild(article);
    });
  }
}
```

### SEO Meta Tags

```typescript
// product.pre.ts
interface ProductData {
  name: string;
  description: string;
  image: string;
  price: number;
}

const productData: ProductData = {
  name: "Amazing Product",
  description: "The best product you can buy",
  image: "https://example.com/product.jpg",
  price: 99.99,
};

const head = document.querySelector("head");

if (head) {
  // Title
  const title = document.querySelector("title");
  if (title) {
    title.textContent = `${productData.name} - My Store`;
  }

  // Meta description
  const metaDesc = document.createElement("meta");
  metaDesc.setAttribute("name", "description");
  metaDesc.setAttribute("content", productData.description);
  head.appendChild(metaDesc);

  // Open Graph
  const ogTitle = document.createElement("meta");
  ogTitle.setAttribute("property", "og:title");
  ogTitle.setAttribute("content", productData.name);
  head.appendChild(ogTitle);

  const ogImage = document.createElement("meta");
  ogImage.setAttribute("property", "og:image");
  ogImage.setAttribute("content", productData.image);
  head.appendChild(ogImage);

  const ogPrice = document.createElement("meta");
  ogPrice.setAttribute("property", "og:price:amount");
  ogPrice.setAttribute("content", productData.price.toString());
  head.appendChild(ogPrice);
}
```

### Sitemap Generation

```typescript
// sitemap.pre.ts
const pages = [
  { url: "/", priority: 1.0 },
  { url: "/about", priority: 0.8 },
  { url: "/contact", priority: 0.5 },
];

const urlset = document.createElement("urlset");
urlset.setAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

pages.forEach((page) => {
  const url = document.createElement("url");
  const loc = document.createElement("loc");
  loc.textContent = `https://example.com${page.url}`;

  const priority = document.createElement("priority");
  priority.textContent = page.priority.toString();

  url.appendChild(loc);
  url.appendChild(priority);
  urlset.appendChild(url);
});

document.documentElement.replaceWith(urlset);
```

### Reading Local Files

```typescript
// documentation.pre.ts
import { readFileSync } from "fs";
import { join } from "path";

const changelogPath = join(import.meta.dir, "..", "CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf-8");

const changelogElement = document.getElementById("changelog");
if (changelogElement) {
  changelogElement.innerHTML = `<pre>${changelog}</pre>`;
}
```

### Conditional Content

```typescript
// index.pre.ts
const isProd = process.env.NODE_ENV === "production";
const body = document.querySelector("body");

if (body) {
  if (isProd) {
    // Add analytics
    const script = document.createElement("script");
    script.src = "https://analytics.example.com/script.js";
    body.appendChild(script);
  } else {
    // Add development banner
    const banner = document.createElement("div");
    banner.style.cssText =
      "background: #fef2f2; padding: 1rem; text-align: center;";
    banner.textContent = "⚠️ Development Mode";
    body.insertBefore(banner, body.firstChild);
  }
}
```

## DOM Manipulation

### Creating Elements

```typescript
const div = document.createElement("div");
div.className = "container";
div.id = "main";
div.innerHTML = "<p>Content</p>";
```

### Modifying Attributes

```typescript
const img = document.querySelector("img");
if (img) {
  img.setAttribute("loading", "lazy");
  img.setAttribute("alt", "Description");
}
```

### Adding Classes

```typescript
const element = document.getElementById("content");
if (element) {
  element.classList.add("active");
  element.classList.remove("hidden");
}
```

### Inserting Content

```typescript
const parent = document.querySelector(".parent");
const child = document.createElement("div");

// Append to end
parent?.appendChild(child);

// Insert at beginning
parent?.insertBefore(child, parent.firstChild);

// Insert before specific element
const ref = document.querySelector(".reference");
parent?.insertBefore(child, ref);
```

### Removing Elements

```typescript
const element = document.querySelector(".remove-me");
element?.remove();

// Or via parent
const parent = document.querySelector(".parent");
const child = document.querySelector(".child");
if (parent && child) {
  parent.removeChild(child);
}
```

## Limitations

### ❌ No Browser APIs

Pre-rendering runs in Node/Bun, not the browser:

```typescript
// ❌ These won't work
window.location;
localStorage;
sessionStorage;
navigator;
```

### ❌ No User Input

Can't access runtime user data:

```typescript
// ❌ No access to form data or user state
const username = document.getElementById("username-input")?.value;
```

### ❌ No Event Listeners

Event listeners are not preserved:

```typescript
// ❌ This listener won't exist in the browser
document.querySelector("button")?.addEventListener("click", () => {
  console.log("clicked");
});
```

**Solution:** Add event listeners in regular `.ts` files that run in the browser.

## Best Practices

### ✅ Use for Build-Time Data

Perfect for:

- Fetching content from CMS/APIs
- Generating static content
- Injecting build metadata
- SEO meta tags
- Conditional development/production code

### ✅ Error Handling

```typescript
// index.pre.ts
async function fetchData() {
  try {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return null;
  }
}

const data = await fetchData();

if (data) {
  // Use data
} else {
  // Show fallback content
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = "<p>Content temporarily unavailable</p>";
  }
}
```

### ✅ Keep Logic Separate

```typescript
// index.pre.ts
import { renderBlogPosts } from "./blog-renderer";

const posts = await fetchPosts();
const container = document.getElementById("blog");

if (container) {
  renderBlogPosts(container, posts);
}
```

### ✅ Validate Data

```typescript
// products.pre.ts
interface Product {
  id: number;
  name: string;
  price: number;
}

function isValidProduct(obj: any): obj is Product {
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.price === "number" &&
    obj.price >= 0
  );
}

const rawData = await fetchProducts();
const products = rawData.filter(isValidProduct);
```

### ❌ Don't Overuse

If you just need to modify specific elements, consider:

- [HTML components](./components-html.md) for static reusable markup
- [TypeScript components](./components-typescript.md) for dynamic elements
- Regular TypeScript for browser interactivity

Pre-rendering is for **document-level** transformations.

## Debugging

### Log During Build

```typescript
// index.pre.ts
console.log("Pre-rendering index.html");

const title = document.querySelector("title");
console.log("Current title:", title?.textContent);

title.textContent = "New Title";
console.log("Updated title:", title.textContent);
```

These logs appear in your terminal during build.

### Check Build Failures

If pre-rendering fails, you'll see:

```
❌ Error: Pre-rendering failed for index.pre.ts
💡 File: /path/to/index.pre.ts
Error details:
TypeError: Cannot read property 'textContent' of null
```

### Verify Output

```bash
tk build
cat web/index.html
```

View the final HTML to confirm your transformations worked.

### HTML Parser Access

You have access to the `@tkeron/html-parser` package:

```typescript
import { parseHTML } from "@tkeron/html-parser";

// This is what Tkeron uses internally
// You usually don't need it in .pre.ts since 'document' is already parsed
```

## Environment Variables

### Built-in Variables

- `TKERON_VERSION` - Current Tkeron version
- `NODE_ENV` - Development or production
- All other environment variables from your shell

```typescript
// index.pre.ts
console.log("Tkeron version:", process.env.TKERON_VERSION);
console.log("Node env:", process.env.NODE_ENV);
console.log("Custom var:", process.env.MY_CUSTOM_VAR);
```

Run with custom env:

```bash
MY_CUSTOM_VAR=hello tk build
```

## Real-World Use Cases

### Static Site Generator

Generate pages from data:

```typescript
// pages.pre.ts
const pages = [
  { slug: "about", title: "About Us", content: "..." },
  { slug: "contact", title: "Contact", content: "..." },
];

// This example shows the concept - in practice, you'd generate
// separate HTML files for each page
```

### Documentation Site

```typescript
// docs.pre.ts
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { marked } from "marked";

const docsDir = join(import.meta.dir, "docs");
const files = readdirSync(docsDir).filter((f) => f.endsWith(".md"));

const nav = document.getElementById("doc-nav");
const content = document.getElementById("doc-content");

if (nav) {
  files.forEach((file) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#${file}">${file.replace(".md", "")}</a>`;
    nav.appendChild(li);
  });
}

if (content) {
  const firstFile = files[0];
  const markdown = readFileSync(join(docsDir, firstFile), "utf-8");
  content.innerHTML = marked(markdown);
}
```

## Next Steps

- See [**TypeScript Components**](./components-typescript.md) for element-level logic
- Check [**HTML Components**](./components-html.md) for simple reusable markup
- Review [**Best Practices**](./best-practices.md) for patterns and tips
- Read [**CLI Reference**](./cli-reference.md) for build options
