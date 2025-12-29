# Getting Started

## Installation

**Requires [Bun](https://bun.sh) runtime:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Install Tkeron:**
```bash
bun install -g tkeron
```

**Verify:**
```bash
tk
```

## Create Your First Project

### Initialize a New Project

```bash
tk init my-website
cd my-website
```

This creates a new directory with a sample project structure:

```
my-website/
├── websrc/              # Source files
│   ├── index.html       # Main page
│   ├── index.ts         # TypeScript for index
│   ├── index.pre.ts     # Pre-rendering script
│   └── *.com.html       # Sample components
└── tkeron.d.ts          # TypeScript definitions
```

### Initialize in Current Directory

If you prefer to set up Tkeron in an existing directory:

```bash
tk init .
```

This creates the `websrc/` folder in your current location.

### Force Overwrite

If files already exist and you want to overwrite them:

```bash
tk init my-website --force
```

## Build Your Project

Build your project to compile it into static files:

```bash
tk build websrc web
```

**Parameters:**
- First argument: source directory (default: `websrc`)
- Second argument: output directory (default: `web`)

**Shorthand:**

```bash
tk build
```

This uses the defaults: `websrc` → `web`

**Output structure:**

```
web/
├── index.html       # Processed HTML (components inlined)
├── index.js         # Compiled TypeScript
└── ...              # Other processed files
```

Notice that `.com.html`, `.com.ts`, and `.pre.ts` files are **not** copied to output - they're processed and inlined.

## Start Development Server

For a better development experience with hot reload:

```bash
tk dev
```

This will:
1. Build your project
2. Start a server at `http://localhost:3000`
3. Watch for file changes
4. Automatically reload the browser on changes

**Custom configuration:**

```bash
tk dev websrc web 8080 0.0.0.0
```

**Parameters:**
- Source directory (default: `websrc`)
- Output directory (default: `web`)
- Port (default: `3000`)
- Host (default: `localhost`)

**Example with custom port:**

```bash
tk dev websrc web 8080
```

Visit `http://localhost:8080` in your browser.

## Your First Component

Let's create a simple reusable component.

### 1. Create a Component File

Create `websrc/greeting.com.html`:

```html
<div style="padding: 1rem; background: #f0f9ff; border-radius: 8px;">
  <h2>Hello from Tkeron! 👋</h2>
  <p>This is a reusable component.</p>
</div>
```

### 2. Use the Component

Edit `websrc/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Tkeron Site</title>
</head>
<body>
  <h1>My Website</h1>
  <greeting></greeting>
  <greeting></greeting>
</body>
</html>
```

### 3. Build and View

```bash
tk build
```

Open `web/index.html` in your browser. You'll see the greeting component inlined twice, with no `<greeting>` tags remaining.

## Understanding the Workflow

### Development Flow

```
1. Edit files in websrc/
   ↓
2. Run tk dev (watches for changes)
   ↓
3. View at http://localhost:3000
   ↓
4. Changes auto-reload
```

### Production Flow

```
1. Edit files in websrc/
   ↓
2. Run tk build
   ↓
3. Deploy web/ folder
```

### What Gets Processed?

| File Type | Purpose | In Output? |
|-----------|---------|------------|
| `.html` | Regular HTML pages | ✅ Yes |
| `.ts` / `.js` | Scripts for pages | ✅ Yes (compiled) |
| `.com.html` | HTML components | ❌ No (inlined) |
| `.com.ts` | TypeScript components | ❌ No (inlined) |
| `.pre.ts` | Pre-rendering scripts | ❌ No (executed) |
| `.css` | Stylesheets | ✅ Yes |
| Images, fonts, etc. | Static assets | ✅ Yes |

## Common Commands

```bash
# Show help
tk

# Build with defaults
tk build

# Build with custom directories
tk build src dist

# Start dev server
tk dev

# Start dev server on port 8080
tk dev websrc web 8080

# Initialize new project
tk init my-project

# Initialize in current directory
tk init .

# Force overwrite existing files
tk init my-project --force
```

## Next Steps

Now that you have a basic understanding:

- Learn about [**HTML Components**](./components-html.md) for reusable markup
- Explore [**TypeScript Components**](./components-typescript.md) for dynamic logic
- Discover [**Pre-rendering**](./pre-rendering.md) for build-time transformations
- Check the [**CLI Reference**](./cli-reference.md) for all available options
- Read [**Best Practices**](./best-practices.md) for tips and patterns

## Troubleshooting

### "Source directory does not exist"

Make sure you're running commands from the right directory:

```bash
# Check if websrc exists
ls websrc

# Or specify the correct path
tk build path/to/websrc path/to/web
```

### "Command not found: tk"

Reinstall globally:

```bash
bun install -g tkeron
```

### Port already in use

Use a different port:

```bash
tk dev websrc web 3001
```

### Components not working

- Component names **must** contain a hyphen: `user-card`, not `usercard`
- File must be named exactly: `user-card.com.html`
- Component files must be in `websrc/` or the same directory as the page using them
