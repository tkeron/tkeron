# tkeron

⚠️ **v4.0.0-alpha.6 - Early Alpha Release**

This is a complete rewrite of tkeron, migrating from Node.js to Bun runtime. 
**Core functionality available:** build system, development server, and pre-rendering. More features coming soon.

---

**tkeron** is a CLI tool for web development with TypeScript that enables a backend-driven frontend approach:

- **Build-time HTML generation:** Use TypeScript to generate static HTML during the build process
- **Pre-rendering capabilities:** Manipulate and create HTML pages programmatically before deployment
- **Simplicity:** Pure TypeScript, HTML, and CSS - no new syntax to learn
- **'No magic' philosophy:** Explicit behavior controlled by the developer
- **Bun-powered:** Fast builds and modern tooling

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
  
- ✅ **Pre-processing and pre-rendering with `.pre.ts` files:** 
  - Generate complete HTML pages from TypeScript
  - Manipulate existing HTML programmatically before build
  - Use TypeScript to modify DOM elements
  - Generate dynamic content and inject data
  - Full DOM manipulation with `@tkeron/html-parser`
  - Create pages without base HTML files (pure pre-rendering)

## What's Coming

- 🚧 Project initialization (`tk init`)
- 🚧 Page and component generators

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

### Using `.pre.ts` Files (Backend Pre-rendering)

Create `.pre.ts` files to generate or manipulate HTML during the **build process** (backend/build-time, not browser runtime):

```typescript
// section/index.pre.ts
const img = <HTMLImageElement>document.querySelector('.my-image');
img.setAttribute('src', './generated-image.png');
```

**How `.pre.ts` files work:**
- Execute at **build time** on the server/local machine (backend)
- Have access to a `document` global representing the HTML file
- Can use standard DOM APIs: `querySelector`, `setAttribute`, `createElement`, etc.
- Output static `.html` files that get bundled
- Can generate complete HTML pages without a corresponding `.html` file
- You can use any npm packages or TypeScript libraries you want

**Key concept:** `.pre.ts` is for generating static HTML at build time, not for browser interactivity. Use regular `.ts` files for client-side JavaScript.

**Powerful use cases:**
- Generate pages from data files (JSON, databases, APIs)
- Create sitemaps and RSS feeds automatically
- Inject build timestamps and environment variables
- Process markdown to HTML
- Generate static content from CMS or external sources
- Build entire static sites programmatically
