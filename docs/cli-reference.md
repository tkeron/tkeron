# CLI Reference

Complete reference for the Tkeron command-line interface.

## Installation

**Requirements:** [Bun](https://bun.sh) runtime (Node.js is not supported)

```bash
# Install Bun first (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install Tkeron globally
bun install -g tkeron
```

This installs the `tk` command globally.

## Global Usage

```bash
tk [command] [arguments] [options]
```

## Commands

### `tk` (no arguments)

Display the Tkeron banner with version information.

```bash
tk
```

**Output:**

```
╔════════════════════════╗
║       TKERON           ║
║    Version X.X.X       ║
╚════════════════════════╝
```

---

### `tk build`

Build your project by processing source files into static output.

**Aliases:** `b`

**Usage:**

```bash
tk build
```

**Convention:**

- Source directory: `websrc/` (relative to current directory)
- Output directory: `web/` (sibling of `websrc/`)

**Examples:**

```bash
# Build the project
tk build

# Using alias
tk b
```

**Build Process:**

1. Creates temporary directory as sibling to source
2. Copies source to temp directory
3. Runs `.pre.ts` files (pre-rendering)
4. Iterative component processing (up to 10 iterations):
   - Processes `.com.ts` components (TypeScript components)
   - Processes `.com.html` components (HTML components)
   - Processes `.com.md` components (Markdown components)
   - Repeats until no changes are detected
5. Compiles TypeScript to JavaScript
6. Copies result to target directory
7. Cleans up temporary directory

**Files Excluded from Output:**

- `*.com.html` - HTML components (inlined)
- `*.com.ts` - TypeScript components (inlined)
- `*.com.md` - Markdown components (inlined)
- `*.pre.ts` - Pre-rendering scripts (executed)

**Exit Codes:**

- `0` - Success
- `1` - Error (missing source directory, build failure, etc.)

**Error Handling:**

```bash
# If source directory doesn't exist
❌ Error: Source directory "websrc" does not exist.
💡 Tip: Create the directory first, check the path, or run 'tk init' to create a new project.
   Expected: /path/to/websrc
```

---

### `tk develop`

Start a development server with hot reload.

**Aliases:** `dev`, `d`

**Usage:**

```bash
tk develop [port] [host]
```

**Arguments:**

| Argument | Type   | Default     | Description                 |
| -------- | ------ | ----------- | --------------------------- |
| `port`   | number | `3000`      | Port for development server |
| `host`   | string | `localhost` | Host to bind server to      |

**Convention:**

- Source directory: `websrc/` (relative to current directory)
- Output directory: `web/` (sibling of `websrc/`)

**Examples:**

```bash
# Start with defaults
tk dev

# Custom port
tk dev 8080

# Bind to all interfaces
tk dev 3000 0.0.0.0

# Complete custom configuration
tk develop 8080 0.0.0.0
```

**What It Does:**

1. Builds the project initially
2. Starts HTTP server
3. Watches source directory for changes
4. Auto-rebuilds on file changes
5. Injects hot-reload script into HTML
6. Refreshes browser automatically

**Server Features:**

- **Hot Reload:** Page auto-refreshes on file changes
- **Development Mode:** Serves from output directory
- **Static File Serving:** Handles all file types
- **Clean URLs:** Access pages without `.html` extension (e.g., `/about` serves `about.html`)
- **Directory Index:** Trailing slash serves `index.html` (e.g., `/blog/` serves `blog/index.html`)
- **Error Handling:** Displays build errors in terminal

**Clean URLs:**

Access HTML pages without the `.html` extension:

| URL                    | Serves                              |
| ---------------------- | ----------------------------------- |
| `/about`               | `about.html`                        |
| `/services`            | `services.html`                     |
| `/docs/api/guide`      | `docs/api/guide.html`               |
| `/blog/`               | `blog/index.html`                   |
| `/products?sort=price` | `products.html` (with query string) |

> Note: Paths containing a dot (e.g., `/file.json`) are treated as file requests and won't have `.html` appended.

**Hot Reload Endpoint:**

The server adds a `/dev-reload` endpoint that uses Server-Sent Events (SSE) to push reload notifications to the browser.

**Injected Script:**

All HTML files automatically get this script before `</body>`:

```javascript
(function () {
  let es;
  function connect() {
    es = new EventSource("/dev-reload");
    es.onmessage = function (e) {
      if (e.data === "reload") {
        console.log("🔄 Reloading page...");
        location.reload();
      }
    };
    es.onerror = function () {
      es.close();
      setTimeout(connect, 1000);
    };
  }
  connect();
})();
```

**Console Output:**

```bash
🔨 Building project...
✅ Build complete!
🚀 Server running at http://localhost:3000
👀 Watching for changes...

# On file change:
📝 Change detected: websrc/index.html
🔨 Rebuilding...
✅ Build complete!
🔄 Reloading browser...
```

**Stopping the Server:**

Press `Ctrl+C` to stop the development server.

---

### `tk init`

Initialize a new Tkeron project.

**Aliases:** `i`

**Usage:**

```bash
tk init <projectName> [--force]
```

**Arguments:**

| Argument      | Type   | Required | Description                                             |
| ------------- | ------ | -------- | ------------------------------------------------------- |
| `projectName` | string | Yes      | Name of project directory, or `.` for current directory |

**Options:**

| Option    | Description                                |
| --------- | ------------------------------------------ |
| `--force` | Overwrite existing files without prompting |

**Examples:**

```bash
# Create new project directory
tk init my-website

# Initialize in current directory
tk init .

# Force overwrite existing files
tk init my-website --force

# Initialize current directory with force
tk init . --force
```

**What It Creates:**

```
project-name/
├── websrc/
│   ├── index.html              - Main HTML file
│   ├── index.ts                - TypeScript for index
│   ├── index.pre.ts            - Pre-rendering example
│   ├── api-service.ts          - Example API service
│   ├── counter-card.com.html   - Sample HTML component
│   ├── hero-section.com.html   - Sample hero section
│   ├── user-badge.com.ts       - Sample TS component
│   └── ... (more examples)
└── tkeron.d.ts                 - TypeScript definitions
```

**Interactive Prompts:**

If initializing in current directory (`.`) and Tkeron files exist:

```bash
⚠️  The following tkeron files already exist: websrc, tkeron.d.ts

Do you want to overwrite them? (y/N):
```

Type `y` to continue or `N` to cancel.

**Using `--force`:**

Skip prompts and overwrite automatically:

```bash
tk init . --force
✓ Cleaned existing tkeron files
✓ Created project "my-project"
```

**After Initialization:**

```bash
# If you created a new directory
cd my-website

# Start development server
tk dev

# Open http://localhost:3000
```

**Template Source:**

The template is copied from `examples/init_sample/` in the Tkeron installation directory.

**Error Handling:**

```bash
# Project name is required
Error: Project name is required

# Directory already exists (without --force)
Error: Directory "my-website" already exists

# Template not found (installation issue)
Error: Template directory not found
```

---

## Command Aliases

Quick reference for command shortcuts:

| Full Command | Aliases          | Description        |
| ------------ | ---------------- | ------------------ |
| `tk build`   | `tk b`           | Build project      |
| `tk develop` | `tk dev`, `tk d` | Start dev server   |
| `tk init`    | `tk i`           | Initialize project |

**Examples:**

```bash
tk b                    # Same as: tk build
tk d                    # Same as: tk develop
tk dev 8080             # Same as: tk develop 8080
tk i my-site            # Same as: tk init my-site
```

---

## Environment Variables

### Built-in Variables

| Variable         | Description            | Set By |
| ---------------- | ---------------------- | ------ |
| `TKERON_VERSION` | Current Tkeron version | Tkeron |
| `NODE_ENV`       | Environment mode       | User   |

**Usage in Pre-rendering:**

```typescript
// index.pre.ts
console.log("Tkeron:", process.env.TKERON_VERSION);
console.log("Environment:", process.env.NODE_ENV);
```

**Setting Custom Variables:**

```bash
# Linux/macOS
NODE_ENV=production tk build

# Windows (PowerShell)
$env:NODE_ENV="production"; tk build

# Windows (cmd)
set NODE_ENV=production && tk build
```

**Multiple Variables:**

```bash
NODE_ENV=production API_URL=https://api.prod.com tk build
```

---

## Exit Codes

| Code | Meaning                                                           |
| ---- | ----------------------------------------------------------------- |
| `0`  | Success                                                           |
| `1`  | Error (missing directory, build failure, invalid arguments, etc.) |

**Usage in Scripts:**

```bash
#!/bin/bash

tk build
if [ $? -eq 0 ]; then
  echo "Build succeeded!"
  # Deploy...
else
  echo "Build failed!"
  exit 1
fi
```

---

## Configuration Files

Tkeron uses **convention over configuration**. There are no configuration files.

**Project Structure Convention:**

- Source directory: `websrc/` (fixed)
- Output directory: `web/` (fixed)
- Component files: `*.com.html` and `*.com.ts`
- Pre-render files: `*.pre.ts`
- Type definitions: `tkeron.d.ts`

**Customization:**

Server configuration is done via command-line arguments:

```bash
# Custom server config
tk dev 8080 0.0.0.0
```

---

## TypeScript Configuration

Tkeron doesn't require a `tsconfig.json`, but you can add one for editor support:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["websrc/**/*", "tkeron.d.ts"]
}
```

This helps your editor provide better autocomplete and type checking.

---

## Integration with Other Tools

### npm Scripts

Add Tkeron commands to `package.json`:

```json
{
  "scripts": {
    "dev": "tk dev",
    "build": "tk build",
    "build:prod": "NODE_ENV=production tk build"
  }
}
```

**Usage:**

```bash
npm run dev
npm run build
npm run build:prod
```

### Deployment Scripts

```bash
#!/bin/bash
# deploy.sh

echo "Building project..."
tk build

if [ $? -eq 0 ]; then
  echo "Deploying to server..."
  rsync -avz --delete web/ user@server:/var/www/html/
  echo "Deployment complete!"
else
  echo "Build failed, deployment aborted"
  exit 1
fi
```

### CI/CD (GitHub Actions)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Tkeron
        run: bun install -g tkeron

      - name: Build
        run: tk build
        env:
          NODE_ENV: production

      - name: Deploy
        run: |
          # Your deployment commands
```

---

## Troubleshooting

### Command Not Found

```bash
# Error
bash: tk: command not found
```

**Solution:**

```bash
# Reinstall globally
bun install -g tkeron

# Verify installation
which tk
tk
```

### Port Already in Use

```bash
# Error during tk dev
Error: Port 3000 is already in use
```

**Solution:**

```bash
# Use different port
tk dev 3001
```

### Source Directory Not Found

```bash
# Error
❌ Error: Source directory "websrc" does not exist.
💡 Tip: Create the directory first, check the path, or run 'tk init' to create a new project.
```

**Solution:**

```bash
# Create directory
mkdir websrc

# Or initialize a new project
tk init .
```

### Permission Denied

```bash
# Error
Error: EACCES: permission denied
```

**Solution:**

```bash
# On Linux/macOS
sudo bun install -g tkeron

# Or use user directory
bun install --global-dir=~/.bun tkeron
```

### Build Hangs

If build seems stuck:

1. Check for infinite loops in `.pre.ts` or `.com.ts`
2. Check for very large files being processed
3. Look for network requests that timeout
4. Press `Ctrl+C` and run with debugging:

```bash
DEBUG=* tk build
```

---

## Getting Help

### Show Banner and Version

```bash
tk
```

### Command Documentation

This document! Also available at:

- [GitHub Repository](https://github.com/tkeron/tkeron)
- [Documentation Site](https://tkeron.com)

### Report Issues

- GitHub Issues: https://github.com/tkeron/tkeron/issues
- Include: Tkeron version, command used, error message, OS

---

## Quick Reference

```bash
# Initialize new project
tk init my-site
cd my-site

# Start development
tk dev

# Build for production
NODE_ENV=production tk build

# Development on port 8080
tk dev 8080

# Initialize in current directory
tk init .

# Force overwrite
tk init my-site --force

# Show version
tk
```

---

## Next Steps

- Learn about [**HTML Components**](./components-html.md)
- Explore [**TypeScript Components**](./components-typescript.md)
- Discover [**Pre-rendering**](./pre-rendering.md)
- Read [**Best Practices**](./best-practices.md)
- Return to [**Overview**](./overview.md)
