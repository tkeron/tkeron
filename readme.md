# tkeron

⚠️ **v4.0.0-alpha.4 - Early Alpha Release**

This is a complete rewrite of tkeron, migrating from Node.js to Bun runtime. 
**Core functionality available:** build system and development server. More features coming soon.

---

**tkeron** is a lightweight microframework for web development with TypeScript, focused on:

- **Simplicity:** Exclusive use of TypeScript, HTML, and CSS, without additional configurations or new syntax.
- **'No magic' philosophy:** Behavior is always explicit and controlled by the developer.
- **Bun-powered:** Fast builds and modern tooling.

## What's Available Now (v4 Alpha)

- ✅ **Build command:** Bundle TypeScript and process HTML files
  ```bash
  tk build <sourceDir> <targetDir>
  # or using alias
  tk b <sourceDir>
  ```
  
- ✅ **Development server with hot reload:**
  ```bash
  tk develop <sourceDir> <targetDir> <port> <host>
  # or using aliases
  tk dev <sourceDir>
  tk d <sourceDir>
  ```
  - Live server with automatic rebuild on file changes
  - File system watcher for instant updates
  - Serves built files from output directory
  
- ✅ **Pre-processing with `.pre.ts` files:** Manipulate HTML programmatically before build
  - Use TypeScript to modify DOM elements
  - Generate dynamic content
  - Process data and inject into HTML
  - Full DOM manipulation with `@tkeron/html-parser`

## What's Coming

- 🚧 Project initialization (`tk init`)
- 🚧 Page and component generators  
- 🚧 Pre-rendering capabilities
- 🚧 Component management library

## Installation

Install **tkeron** globally using npm:

```bash
npm i -g tkeron
```

**Requirements:** Bun runtime (Node.js support coming later)

## Examples

The `examples/` directory contains three working examples:

- **`basic_build/`** - Simple TypeScript + HTML project
- **`with_assets/`** - Project with nested directories and assets
- **`with_pre/`** - Demonstrates `.pre.ts` preprocessing capabilities

### Using `.pre.ts` Files

Create `.pre.ts` files alongside your HTML files to manipulate them programmatically before the build:

```typescript
// section/index.pre.ts
const img = <HTMLImageElement>document.querySelector('.my-image');
img.setAttribute('src', './generated-image.png');
```

The `.pre.ts` file:
- Has access to a `document` global representing the HTML file
- Can use `querySelector`, `setAttribute`, and other DOM methods
- Runs before the final build, modifying the HTML output
- Can generate HTML files if no corresponding `.html` exists

This enables powerful use cases like:
- Generating lists from data files
- Creating sitemaps automatically
- Injecting build timestamps
- Processing markdown to HTML
- Dynamic component generation
