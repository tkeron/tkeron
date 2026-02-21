# Tkeron

CLI build tool for vanilla web development. TypeScript compilation, component organization, zero runtime.

Powered by [Bun](https://bun.sh).

## Install

```bash
# Install Bun first
curl -fsSL https://bun.sh/install | bash

# Install Tkeron
bun install -g tkeron
```

## Features

- TypeScript → vanilla JavaScript
- HTML components (`.com.html`) - inline at build time
- TypeScript components (`.com.ts`) - dynamic generation
- Markdown components (`.com.md`) - write content in Markdown, rendered to HTML at build time
- Pre-rendering (`.pre.ts`) - DOM manipulation at build time
- Dev server with hot reload
- Zero config

## Usage

```bash
tk init my-site    # Create project
tk dev             # Dev server (localhost:3000)
tk build           # Build to web/
```

## Examples

**HTML Component:**

```html
<!-- counter-card.com.html -->
<section>
  <h2>Counter</h2>
  <button id="increment">Click me!</button>
  <div>Clicks: <span id="count">0</span></div>
</section>
```

**TypeScript Component:**

```typescript
// user-badge.com.ts
const count = com.getAttribute("count") || "3";
const items = [];
for (let i = 1; i <= parseInt(count); i++) {
  items.push(`<li>Item ${i}</li>`);
}
com.innerHTML = `<ul>${items.join("")}</ul>`;
```

**Pre-rendering:**

```typescript
// index.pre.ts
const response = await fetch("https://api.quotable.io/random");
const data = await response.json();
document.getElementById("quote").textContent = data.content;
```

## Documentation

📖 **[Full Documentation](./docs/overview.md)**

- **[Getting Started](./docs/getting-started.md)** - Installation and first steps
- **[HTML Components](./docs/components-html.md)** - Reusable markup with `.com.html`
- **[TypeScript Components](./docs/components-typescript.md)** - Dynamic components with `.com.ts`
- **[Markdown Components](./docs/components-markdown.md)** - Content in Markdown with `.com.md`
- **[Pre-rendering](./docs/pre-rendering.md)** - Build-time HTML transformation
- **[CLI Reference](./docs/cli-reference.md)** - All commands and options
- **[Best Practices](./docs/best-practices.md)** - Patterns, limits, and anti-patterns

## Commands

```bash
tk init <name>           # Initialize new project
tk build [src] [out]     # Build project (default: websrc → web)
tk dev [src] [out]       # Dev server with hot reload (port 3000)
```

**Aliases:** `tk i`, `tk b`, `tk d`

See [CLI Reference](./docs/cli-reference.md) for all options.

## MCP Server (AI Integration)

Tkeron includes a Model Context Protocol server for AI agents.

**Setup:**

```bash
bun install -g tkeron
```

**Configure in VS Code** (`~/.config/Code/User/mcp.json`):

```json
{
  "servers": {
    "tkeron": {
      "command": "tkeron-mcp"
    }
  }
}
```

**Note:** Other editors may use different configuration formats.

See [MCP Documentation](./docs/mcp-server.md) for details.

## Testing API

Tkeron exports a testing helper to validate your built projects:

```typescript
import { getBuildResult } from "tkeron";
import { expect, it } from "bun:test";

it("should render my component", async () => {
  const result = await getBuildResult("./websrc");
  const dom = result["index.html"].dom;

  const myComponent = dom.getElementById("my_component");
  expect(myComponent.innerHTML).toBe("expected content");
});
```

**Returns:** `Record<string, FileInfo>` with:

- `dom` - Parsed DOM (HTML files only)
- `getContentAsString()` - File content (text files only)
- `fileName`, `filePath`, `path` - Path info
- `type` - MIME type
- `size` - File size in bytes
- `fileHash` - SHA-256 hash

## Requirements

- **[Bun](https://bun.sh)** runtime (Node.js not supported)
- Linux, macOS, or Windows (WSL)

## Examples

Check the [`examples/`](./examples/) directory for working projects:

- `init_sample/` - Template with all features
- `with_pre/` - Pre-rendering examples
- `with_com_html_priority/` - Component resolution
- `with_com_ts/` - TypeScript components

## License

MIT

---

**[📖 Read the full documentation](./docs/overview.md)** to learn everything about Tkeron.
