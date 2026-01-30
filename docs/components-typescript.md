# TypeScript Components

TypeScript components (`.com.ts` files) let you create dynamic, logic-driven components that run at build time. They have access to attributes and can generate HTML programmatically.

## Quick Start

Create a `.com.ts` file:

```typescript
// greeting.com.ts
const name = com.getAttribute("name") || "World";
com.innerHTML = `<h1>Hello, ${name}!</h1>`;
```

Use it with attributes:

```html
<greeting name="Alice"></greeting>
<greeting name="Bob"></greeting>
<greeting></greeting>
```

Build output:

```html
<h1>Hello, Alice!</h1>
<h1>Hello, Bob!</h1>
<h1>Hello, World!</h1>
```

## How They Work

### The `com` Variable

Every `.com.ts` file has access to a special `com` variable:

```typescript
// The 'com' variable is the DOM element itself
com.getAttribute("attr-name"); // Read attributes
com.innerHTML = "..."; // Set content (this is what's kept)
com.tagName; // Get element name
```

**Important:** Only the `innerHTML` you set is included in the final output. Everything else is discarded.

### Build-Time Execution

`.com.ts` files run during the build process with **Bun runtime**, not in the browser:

```
Build Time:
1. Find <user-card name="John">
2. Execute user-card.com.ts with com.getAttribute('name') = 'John'
3. Capture com.innerHTML
4. Replace <user-card> with the innerHTML

Browser sees only:
<div class="card">John</div>
```

### Component Resolution

Same as HTML components:

1. **Same directory** as the file using it
2. **Root directory** (`websrc/`)

## Basic Examples

### Attribute-Based Content

```typescript
// user-badge.com.ts
const name = com.getAttribute("name") || "Guest";
const role = com.getAttribute("role") || "User";

com.innerHTML = `
  <div class="badge">
    <span class="badge-name">${name}</span>
    <span class="badge-role">${role}</span>
  </div>
`;
```

**Usage:**

```html
<user-badge name="Alice" role="Admin"></user-badge>
<user-badge name="Bob" role="Editor"></user-badge>
<user-badge></user-badge>
```

**Output:**

```html
<div class="badge">
  <span class="badge-name">Alice</span>
  <span class="badge-role">Admin</span>
</div>
<div class="badge">
  <span class="badge-name">Bob</span>
  <span class="badge-role">Editor</span>
</div>
<div class="badge">
  <span class="badge-name">Guest</span>
  <span class="badge-role">User</span>
</div>
```

### Dynamic Lists

```typescript
// item-list.com.ts
const count = parseInt(com.getAttribute("count") || "3");
const items = [];

for (let i = 1; i <= count; i++) {
  items.push(`<li>Item ${i}</li>`);
}

com.innerHTML = `
  <ul class="item-list">
    ${items.join("")}
  </ul>
`;
```

**Usage:**

```html
<item-list count="5"></item-list>
```

**Output:**

```html
<ul class="item-list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
  <li>Item 4</li>
  <li>Item 5</li>
</ul>
```

### Conditional Rendering

```typescript
// alert-box.com.ts
const type = com.getAttribute("type") || "info";
const message = com.getAttribute("message") || "No message provided";

const colors = {
  info: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
};

const color = colors[type as keyof typeof colors] || colors.info;

com.innerHTML = `
  <div style="padding: 1rem; background: ${color}20; border-left: 4px solid ${color}; border-radius: 4px;">
    <strong style="color: ${color}">${type.toUpperCase()}</strong>
    <p style="margin: 0.5rem 0 0 0; color: #333;">${message}</p>
  </div>
`;
```

**Usage:**

```html
<alert-box type="success" message="Operation completed!"></alert-box>
<alert-box type="error" message="Something went wrong!"></alert-box>
```

## Advanced Features

### Full TypeScript Support

You can use all TypeScript features:

```typescript
// stats-card.com.ts
interface Stats {
  label: string;
  value: number;
  trend: "up" | "down" | "neutral";
}

const label = com.getAttribute("label") || "Stat";
const value = parseInt(com.getAttribute("value") || "0");
const trend = (com.getAttribute("trend") as Stats["trend"]) || "neutral";

const trendIcon = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

const trendColor = {
  up: "#22c55e",
  down: "#ef4444",
  neutral: "#6b7280",
};

com.innerHTML = `
  <div class="stats-card">
    <div class="stats-label">${label}</div>
    <div class="stats-value">${value.toLocaleString()}</div>
    <div class="stats-trend" style="color: ${trendColor[trend]}">
      ${trendIcon[trend]} ${trend}
    </div>
  </div>
`;
```

### Importing Modules

You can import any TypeScript module or npm package:

```typescript
// product-card.com.ts
import { formatPrice } from "./utils";

const name = com.getAttribute("name") || "Product";
const price = parseFloat(com.getAttribute("price") || "0");

com.innerHTML = `
  <div class="product-card">
    <h3>${name}</h3>
    <p class="price">${formatPrice(price)}</p>
  </div>
`;
```

```typescript
// utils.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
```

### Using External APIs

Fetch data at build time:

```typescript
// weather-widget.com.ts
const city = com.getAttribute("city") || "London";

interface WeatherData {
  temperature: number;
  condition: string;
}

async function getWeather(city: string): Promise<WeatherData> {
  const response = await fetch(`https://api.example.com/weather?city=${city}`);
  return response.json();
}

const weather = await getWeather(city);

com.innerHTML = `
  <div class="weather-widget">
    <h3>${city}</h3>
    <div class="temperature">${weather.temperature}°C</div>
    <div class="condition">${weather.condition}</div>
  </div>
`;
```

**Note:** The API call happens **once at build time**, not in the browser. The output is static HTML.

### Using npm Packages

```typescript
// markdown-content.com.ts
import { marked } from "marked";

const content = com.getAttribute("content") || "# Hello";
const html = marked(content);

com.innerHTML = `
  <div class="markdown-content">
    ${html}
  </div>
`;
```

First install the package:

```bash
bun add marked
```

## Nested Components

TypeScript components can use other components:

```typescript
// user-profile.com.ts
const username = com.getAttribute("username") || "anonymous";
const bio = com.getAttribute("bio") || "No bio provided";

com.innerHTML = `
  <div class="user-profile">
    <user-avatar username="${username}"></user-avatar>
    <div class="user-info">
      <h3>${username}</h3>
      <p>${bio}</p>
    </div>
  </div>
`;
```

The `<user-avatar>` component will be processed in the next build step.

## Limitations

### ❌ No Event Listeners

Event listeners are lost in the static output:

```typescript
// ❌ This won't work
com.addEventListener("click", () => {
  console.log("clicked");
});
```

**Solution:** Add event listeners in a regular `.ts` file that loads in the browser:

```typescript
// index.ts (runs in browser)
document.querySelectorAll(".my-button").forEach((button) => {
  button.addEventListener("click", () => {
    console.log("clicked");
  });
});
```

### ❌ No DOM Access Beyond `com`

You can't access other parts of the document:

```typescript
// ❌ This won't work
const header = document.querySelector("header");
com.innerHTML = header?.textContent || "";
```

**Solution:** Use [pre-rendering](./pre-rendering.md) for document-wide transformations.

### ❌ No Reactive State

Components run once at build time. They can't react to user input:

```typescript
// ❌ This won't work
let count = 0;
com.innerHTML = `
  <button onclick="count++">Count: ${count}</button>
`;
```

**Solution:** Use vanilla JavaScript in your regular `.ts` files for interactivity.

### ❌ No Runtime Data

Build-time components can't access runtime data:

```typescript
// ❌ This won't work - no access to current user
const currentUser = localStorage.getItem("user");
com.innerHTML = `<p>Hello, ${currentUser}</p>`;
```

**Solution:** Either fetch at build time or render with client-side JavaScript.

## Best Practices

### ✅ Use for Attribute-Driven Components

Perfect for:

- Components that vary based on attributes
- Generating repetitive HTML
- Build-time data transformation
- Static list generation

### ✅ Validate Attributes

```typescript
// color-badge.com.ts
const validColors = ["red", "blue", "green", "yellow"];
const color = com.getAttribute("color") || "blue";

if (!validColors.includes(color)) {
  throw new Error(
    `Invalid color: ${color}. Use one of: ${validColors.join(", ")}`,
  );
}

com.innerHTML = `<span class="badge badge-${color}">Badge</span>`;
```

Build will fail with a clear error if validation fails.

### ✅ Escape HTML

Prevent XSS by escaping user-provided content:

```typescript
// user-comment.com.ts
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const comment = com.getAttribute("comment") || "";
com.innerHTML = `<p>${escapeHtml(comment)}</p>`;
```

### ✅ Use TypeScript Types

```typescript
// card.com.ts
type CardVariant = "default" | "outlined" | "elevated";

const variant = (com.getAttribute("variant") as CardVariant) || "default";
const title = com.getAttribute("title") || "Card";

const variants = {
  default: "border: 1px solid #e5e7eb",
  outlined: "border: 2px solid #3b82f6",
  elevated: "box-shadow: 0 4px 6px rgba(0,0,0,0.1)",
};

com.innerHTML = `
  <div class="card" style="${variants[variant]}">
    <h3>${title}</h3>
  </div>
`;
```

### ✅ Extract Complex Logic

```typescript
// data-table.com.ts
import { generateTableRows } from "./table-utils";

const data = com.getAttribute("data") || "[]";
const rows = generateTableRows(JSON.parse(data));

com.innerHTML = `
  <table class="data-table">
    <tbody>${rows}</tbody>
  </table>
`;
```

### ❌ Don't Use for Simple Static Content

If a component doesn't need attributes or logic, use [HTML components](./components-html.md) instead:

```html
<!-- ✅ Better as .com.html -->
<!-- footer.com.html -->
<footer>
  <p>&copy; 2025 Company</p>
</footer>
```

## Debugging

### Log at Build Time

```typescript
// debug-component.com.ts
const value = com.getAttribute("value");
console.log("Building component with value:", value);

com.innerHTML = `<p>${value}</p>`;
```

The console.log will appear in your terminal during build.

### Check Execution Errors

If a component fails, you'll see:

```
❌ Error: Component <my-component> failed to execute.
💡 Component file: /path/to/my-component.com.ts
Error details:
ReferenceError: undefined variable
```

### Verify Output

```bash
tk build
cat web/index.html | grep "expected-content"
```

## Real-World Examples

### Image Gallery

```typescript
// image-gallery.com.ts
const images = com.getAttribute("images")?.split(",") || [];

const imageElements = images
  .map(
    (img, idx) => `
  <div class="gallery-item">
    <img src="${img.trim()}" alt="Image ${idx + 1}" loading="lazy">
  </div>
`,
  )
  .join("");

com.innerHTML = `
  <div class="image-gallery">
    ${imageElements}
  </div>
`;
```

**Usage:**

```html
<image-gallery images="/img1.jpg, /img2.jpg, /img3.jpg"></image-gallery>
```

### Progress Bar

```typescript
// progress-bar.com.ts
const progress = Math.min(
  100,
  Math.max(0, parseInt(com.getAttribute("progress") || "0")),
);
const label = com.getAttribute("label") || `${progress}%`;

com.innerHTML = `
  <div class="progress-bar-container">
    <div class="progress-bar-fill" style="width: ${progress}%"></div>
    <span class="progress-bar-label">${label}</span>
  </div>
`;
```

### Code Block with Syntax Highlighting

```typescript
// code-block.com.ts
import { codeToHtml } from "shiki";

const code = com.getAttribute("code") || "";
const lang = com.getAttribute("lang") || "typescript";

const html = await codeToHtml(code, {
  lang,
  theme: "github-dark",
});

com.innerHTML = `
  <div class="code-block">
    ${html}
  </div>
`;
```

First install shiki:

```bash
bun add shiki
```

**Usage:**

```html
<code-block lang="javascript" code="console.log('Hello')"></code-block>
```

### Social Share Buttons

```typescript
// social-share.com.ts
const url = com.getAttribute("url") || "";
const title = com.getAttribute("title") || "";

const encodedUrl = encodeURIComponent(url);
const encodedTitle = encodeURIComponent(title);

com.innerHTML = `
  <div class="social-share">
    <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" 
       target="_blank" class="share-twitter">
      Tweet
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
       target="_blank" class="share-facebook">
      Share
    </a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" 
       target="_blank" class="share-linkedin">
      Share
    </a>
  </div>
`;
```

## TypeScript Configuration

Add types for better development experience:

```typescript
// Include tkeron.d.ts in your project
/// <reference path="./tkeron.d.ts" />

// Now 'com' has full type information
const attr = com.getAttribute("name"); // TypeScript knows about this
```

## Performance Considerations

### Build-Time Cost

Complex components increase build time:

```typescript
// ⚠️ Expensive at build time
const data = await fetch("https://api.example.com/large-dataset");
```

For large datasets, consider caching or pre-processing.

### Output Size

Generated HTML is inlined everywhere the component is used:

```html
<!-- If you use <large-component> 100 times -->
<!-- The HTML is duplicated 100 times in output -->
```

Keep component output size reasonable.

## Next Steps

- Learn about [**Pre-rendering**](./pre-rendering.md) for document-wide transformations
- See [**HTML Components**](./components-html.md) for simpler static components
- Check [**Best Practices**](./best-practices.md) for component patterns
- Review [**CLI Reference**](./cli-reference.md) for build options
