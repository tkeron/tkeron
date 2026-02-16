# Common Issues and Solutions

When building Tkeron projects, AI agents and users may encounter these common issues. This guide helps prevent and resolve them.

## Script Tag References

### Issue: "Bundle failed" or Cannot Resolve Module

**Problem:** HTML references `.js` files but source files are `.ts`

```html
<!-- ❌ WRONG -->
<script src="index.js"></script>

<!-- ✅ CORRECT -->
<script type="module" src="index.ts"></script>
```

**Why this happens:**

- Tkeron uses `Bun.build()` to bundle files
- Bun resolves all file references in HTML (scripts, stylesheets, images)
- If HTML references `index.js` but only `index.ts` exists, Bun fails with "Could not resolve"
- The error message may just say "Bundle failed" without details

**Solution:**

- Always reference `.ts` files directly in HTML
- Add `type="module"` attribute to script tags
- Tkeron will automatically compile `.ts` → `.js` and update the reference

**Example project structure:**

```
websrc/
├── index.html          <!-- References index.ts -->
├── index.ts            <!-- Your TypeScript code -->
└── styles.css
```

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello</h1>
    <script type="module" src="index.ts"></script>
  </body>
</html>
```

**After build** (`tk build`):

```
web/
├── index.html          <!-- Now references index.js -->
├── index.js            <!-- Compiled from index.ts -->
└── index.css           <!-- Bundled CSS -->
```

## Component Naming

### Issue: Component Name Must Contain Hyphen

**Problem:** Custom elements without hyphens are invalid

```html
<!-- ❌ WRONG -->
<header></header>
<!-- Reserved HTML tag -->
<button></button>
<!-- Reserved HTML tag -->

<!-- ✅ CORRECT -->
<app-header></app-header>
<my-button></my-button>
```

**Why this happens:**

- HTML custom elements MUST contain at least one hyphen (web standard)
- This distinguishes them from standard HTML elements
- Tkeron validates this at build time

**Solution:**

- Always use hyphens in component names
- Match filename to element name (without `.com.html`/`.com.ts`)

**Examples:**

```
user-card.com.html    → <user-card>
nav-menu.com.html     → <nav-menu>
blog-post.com.ts      → <blog-post>
```

## File References

### Issue: Assets Not Found After Build

**Problem:** Relative paths break after build

```html
<!-- ❌ WRONG - breaks if HTML moves -->
<img src="images/logo.png" />

<!-- ✅ CORRECT - works from any HTML location -->
<img src="./images/logo.png" />
```

**Why this happens:**

- Tkeron copies your entire source directory structure
- Relative paths must account for current file location
- Use `./` for same directory, `../` for parent

**Solution:**

- Always use explicit relative paths (`./` or `../`)
- Keep assets in source directory (`websrc/`)
- They'll be copied to output (`web/`) in same structure

## TypeScript Compilation

### Issue: TypeScript Errors Prevent Build

**Problem:** Type errors block compilation

```typescript
// ❌ WRONG
const user = { name: "Alice" };
user.age = 30; // Error: Property 'age' does not exist
```

**Why this happens:**

- Tkeron uses Bun's TypeScript transpiler
- Type errors can prevent successful builds
- Missing types for global variables

**Solution:**

- Use `tkeron.d.ts` for global type declarations
- Fix type errors before building
- Use `any` strategically if types are complex

```typescript
// ✅ CORRECT
const user: { name: string; age?: number } = { name: "Alice" };
user.age = 30; // OK
```

## Component Resolution

### Issue: Component Not Found

**Problem:** Tkeron can't find your component file

```html
<!-- In blog/post.html -->
<user-card></user-card>
```

**Why this happens:**

- Tkeron searches in 2 locations only:
  1. Same directory as HTML file
  2. Root directory (`websrc/`)
- Not in subdirectories or parent directories (except root)

**Solution:**
Either place component:

- In `blog/user-card.com.html` (next to `post.html`)
- Or in `websrc/user-card.com.html` (root, available everywhere)

## Build Performance

### Issue: Slow Builds

**Problem:** Large projects take time to build

**Why this happens:**

- Tkeron processes all files on every build
- Many components create processing overhead
- Large assets slow down copying

**Solution:**

- Use `tk dev` for development (hot reload)
- Only use `tk build` for production builds
- Keep assets reasonably sized
- Avoid excessive component nesting

## Common AI Agent Mistakes

When AI agents build Tkeron projects, watch for:

1. **Script references**: Always `.ts` in HTML, never `.js`
2. **Component names**: Must contain hyphen
3. **Type safety**: Don't over-complicate with types
4. **File paths**: Use explicit relative paths (`./`, `../`)

## Preventing Issues

**Before creating a Tkeron project:**

- ✅ Reference `.ts` files in HTML (Tkeron handles compilation)
- ✅ Use hyphens in all component names
- ✅ Use `./` for same-directory asset references
- ✅ Test with `tk dev` before building
- ✅ Keep components simple and focused

**After encountering errors:**

- Check script tag references first (most common)
- Verify component names have hyphens
- Ensure dependencies are installed
- Review file paths (use `./` explicitly)
- Run `tk build` to see full error messages
