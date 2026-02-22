# Tkeron Documentation

## What is Tkeron?

CLI build tool for vanilla web development. Compiles TypeScript, organizes HTML with components, outputs static files.

Powered by [Bun](https://bun.sh).

## What it does

- Compiles TypeScript to JavaScript
- Inlines HTML components (`.com.html`)
- Executes TypeScript components (`.com.ts`) at build time
- Renders Markdown components (`.com.md`) at build time
- Runs pre-rendering scripts (`.pre.ts`)
- Copies assets
- Dev server with hot reload

**Build time:** Components execute, TypeScript compiles
**Runtime:** Your vanilla JavaScript runs in the browser

## Key Features

**HTML Components** - Organize markup:

```html
<!-- header.com.html -->
<header><h1>Site Title</h1></header>
```

**TypeScript Components** - Dynamic generation:

```typescript
// user-badge.com.ts
const count = com.getAttribute("count") || "3";
com.innerHTML = `<ul>${generateItems(count)}</ul>`;
```

**Pre-rendering** - DOM manipulation at build time:

```typescript
// index.pre.ts
const data = await fetch("https://api.example.com/data");
document.getElementById("content").innerHTML = processData(data);
```

## System Requirements

- **Bun runtime** (v1.0 or higher) - [Install Bun](https://bun.sh)
- Operating systems: Linux, macOS, Windows (via WSL)
- No Node.js required

## Documentation Sections

### Getting Started

- [**Getting Started Guide**](./getting-started.md) - Installation, first project, basic workflow

### Core Concepts

- [**HTML Components**](./components-html.md) - Create reusable HTML components with `.com.html`
- [**TypeScript Components**](./components-typescript.md) - Build dynamic components with `.com.ts`
- [**Pre-rendering**](./pre-rendering.md) - Transform HTML at build time with `.pre.ts`

### Reference

- [**CLI Reference**](./cli-reference.md) - Complete command-line interface documentation
- [**Best Practices**](./best-practices.md) - Patterns, anti-patterns, and limitations
- [**MCP Server**](./mcp-server.md) - AI agent integration via Model Context Protocol

## Quick Example

Create a simple component:

```html
<!-- user-card.com.html -->
<div class="card">
  <h3>User Card</h3>
  <p>This is a reusable component</p>
</div>
```

Use it in your page:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
    <user-card></user-card>
    <user-card></user-card>
  </body>
</html>
```

Build it:

```bash
tk build
```

Result: Both `<user-card>` elements are replaced with the component's HTML. No runtime JavaScript needed.

## Build Process

```
websrc/               Build Steps           web/
├── index.html    →  1. .pre.ts        →  ├── index.html
├── index.ts         2. .com.ts           ├── index.js
├── index.pre.ts     3. .com.html
├── nav.com.html     4. .com.md
├── card.com.ts      5. TypeScript
└── info.com.md      6. Assets
```

Component files (`.com.html`, `.com.ts`, `.com.md`, `.pre.ts`) are not copied to output.

---

Ready to start? Head to the [Getting Started Guide](./getting-started.md).
