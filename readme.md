# tkeron

⚠️ **v4.0.0-alpha.1 - Early Alpha Release**

This is a complete rewrite of tkeron, migrating from Node.js to Bun runtime. 
**Currently only basic build functionality is available.** More features coming soon.

---

**tkeron** is a lightweight microframework for web development with TypeScript, focused on:

- **Simplicity:** Exclusive use of TypeScript, HTML, and CSS, without additional configurations or new syntax.
- **'No magic' philosophy:** Behavior is always explicit and controlled by the developer.
- **Bun-powered:** Fast builds and modern tooling.

## What's Available Now (v4 Alpha)

- ✅ **Build command:** Bundle TypeScript and process HTML files
  ```bash
  tk build <sourceDir> <targetDir>
  ```

## What's Coming

- 🚧 Project initialization (`tk init`)
- 🚧 Page and component generators  
- 🚧 Dev server with hot reloading
- 🚧 Pre-rendering capabilities
- 🚧 Component management library

## Installation

Install **tkeron** globally using npm:

```bash
npm i -g tkeron
```

**Requirements:** Bun runtime (Node.js support coming later)

## Example

See the `examples/basic_build` directory for a working example.
