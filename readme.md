# tkeron

🚀 **v4.0.0-beta.1 - Beta Release**

This is a complete rewrite of tkeron, migrating from Node.js to Bun runtime. 
**All core features are complete and stable:** build system, development server, pre-rendering, HTML components, and TypeScript components.

---

**tkeron** is a CLI tool for web development with TypeScript that enables a backend-driven frontend approach:

- **Build-time HTML generation:** Use TypeScript to generate static HTML during the build process
- **Pre-rendering capabilities:** Manipulate and create HTML pages programmatically before deployment
- **Simplicity:** Pure TypeScript, HTML, and CSS - no new syntax to learn
- **'No magic' philosophy:** Explicit behavior controlled by the developer
- **Bun-powered:** Fast builds and modern tooling

## Features

- ✅ **Project initialization:**
  ```bash
  tk init <projectName>
  # or using alias
  tk i my-app
  ```
  - Creates new project with complete template
  - Includes examples of all tkeron features
  - Ready-to-use development setup

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

- ✅ **HTML Components with `.com.html` files:**
  - Create reusable HTML components
  - Custom elements automatically replaced with component content
  - Support for nested components
  - Local and root component resolution

- ✅ **TypeScript Components with `.com.ts` files:**
  - Dynamic components with full TypeScript logic
  - Access to element attributes and content
  - Generate HTML programmatically at build time
  - Use TypeScript features: types, functions, conditionals, loops
  - Import external libraries and modules

## Installation

Install **tkeron** globally using npm:

```bash
npm i -g tkeron
```

**Requirements:** Bun runtime (Node.js support coming later)

## Quick Start

Create a new project with the `init` command:

```bash
# Create new project in a subdirectory
tk init my-project
cd my-project
tk dev src

# Or initialize in current directory
mkdir my-project && cd my-project
tk init .

# Force overwrite if tkeron files already exist
tk init . force=true
```

This creates a complete project with examples of all tkeron features:
- Pre-rendering with `.pre.ts`
- HTML components with `.com.html`
- TypeScript components with `.com.ts`
- Interactive counter example
- Ready-to-use development setup

**Note:** When initializing in a directory with existing tkeron files (`src/`, `web/`, `tkeron.d.ts`), you'll be prompted to confirm overwriting. Use `force=true` to skip the prompt. Other files in the directory are preserved.

Open `http://localhost:8080` to see your app!

## Examples

The `examples/` directory contains working examples:

- **`init_sample/`** - Complete template used by `tk init` command (all features)
- **`basic_build/`** - Simple TypeScript + HTML project
- **`with_assets/`** - Project with nested directories and assets
- **`with_pre/`** - Demonstrates `.pre.ts` preprocessing capabilities
- **`with_com_html_priority/`** - HTML component resolution (local vs root)
- **`with_com_ts/`** - TypeScript components with dynamic logic
- **`with_com_ts_priority/`** - TypeScript component priority demonstration
- **`with_com_mixed_priority/`** - Mixed `.com.html` and `.com.ts` priority handling

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

### Using `.com.html` Files (HTML Components)

Create reusable HTML components with `.com.html` files. Any custom element (tag with a hyphen) will be automatically replaced with the component's content during build:

```html
<!-- my-component.com.html -->
<div class="my-component">
  <h1>Component Title</h1>
  <p>Reusable content</p>
</div>
```

```html
<!-- index.html -->
<body>
  <my-component></my-component>
</body>
```

**Result after build:**
```html
<body>
  <div class="my-component">
    <h1>Component Title</h1>
    <p>Reusable content</p>
  </div>
</body>
```

**Component features:**
- **Complete substitution:** The component replaces the entire custom element tag
- **Nested components:** Components can include other components
- **Local resolution:** Components in the same directory take priority over root components
- **No runtime overhead:** All substitution happens at build time
- **Circular dependency detection:** Prevents infinite loops

**Use cases:**
- Reusable headers, footers, and navigation bars
- Consistent UI elements across multiple pages
- Building design systems with pure HTML
- DRY principle for HTML structure

### Using `.com.ts` Files (TypeScript Components)

Create dynamic HTML components with full TypeScript logic using `.com.ts` files. These components execute at build time and have access to a `com` variable representing the HTML element:

```typescript
// user-card.com.ts
const name = com.getAttribute("data-name") || "Unknown";
const role = com.getAttribute("data-role") || "N/A";

// Use TypeScript logic
com.innerHTML = `
  <div class="user-card">
    <h3>${name}</h3>
    <p>Role: ${role}</p>
  </div>
`;
```

```html
<!-- index.html -->
<body>
  <user-card data-name="Alice" data-role="Developer"></user-card>
  <user-card data-name="Bob" data-role="Designer"></user-card>
</body>
```

**Result after build:**
```html
<body>
  <div class="user-card">
    <h3>Alice</h3>
    <p>Role: Developer</p>
  </div>
  <div class="user-card">
    <h3>Bob</h3>
    <p>Role: Designer</p>
  </div>
</body>
```

**TypeScript component features:**
- **Full TypeScript support:** Use types, functions, classes, and all TypeScript features
- **Attribute access:** Read custom attributes from the element using `com.getAttribute()`
- **Content access:** Read inner content with `com.innerHTML` or `com.querySelector()`
- **Import libraries:** Use npm packages and external modules
- **Build-time execution:** All logic runs during build, no runtime JavaScript overhead
- **Priority over `.com.html`:** If both `.com.ts` and `.com.html` exist, `.com.ts` takes priority

**Use cases:**
- Generate cards from data attributes
- Create lists with TypeScript array methods
- Conditional rendering based on attributes
- Date/time formatting and calculations
- Complex data transformations
- Reading from files or APIs at build time
- Template-based HTML generation with type safety

**Example with logic:**
```typescript
// product-list.com.ts
const products = ["Apple", "Banana", "Cherry", "Date"];

const items = products
  .filter(p => p.length > 5)
  .map((p, i) => `<li>${i + 1}. ${p}</li>`)
  .join("\n");

com.innerHTML = `<ul>${items}</ul>`;
```
