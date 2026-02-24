# Markdown Components

Markdown components (`.com.md` files) let you write reusable content in Markdown that gets converted to HTML and inlined at build time. Powered by Bun's built-in Markdown parser with full GitHub Flavored Markdown (GFM) support.

## Quick Start

Create a file named with `.com.md` extension:

```markdown
<!-- hero-text.com.md -->

# Welcome to My Site

This is a **great** place to start.

- Fast
- Simple
- Powerful
```

Use it with a matching custom element:

```html
<!-- index.html -->
<hero-text></hero-text>
```

Build, and the custom element is replaced with the rendered HTML.

## How They Work

### 1. Component Naming

Component filenames must:

- End with `.com.md`
- Match the custom element name (without `.com.md`)
- Use lowercase with hyphens

**Examples:**

| Filename            | Custom Element | Valid?            |
| ------------------- | -------------- | ----------------- |
| `hero-text.com.md`  | `<hero-text>`  | ✅ Yes            |
| `about-info.com.md` | `<about-info>` | ✅ Yes            |
| `intro.com.md`      | `<intro>`      | ❌ No (no hyphen) |

### 2. Component Resolution

Tkeron looks for components in this order:

1. **Same directory** as the file using it
2. **Any directory** in the source tree (via glob search)

**Example structure:**

```
websrc/
├── index.html
├── site-intro.com.md           # Available to all files
├── blog/
│   ├── post.html
│   └── post-footer.com.md      # Takes priority for blog/post.html
```

In `blog/post.html`:

- `<post-footer>` → Finds `blog/post-footer.com.md` first (same directory)
- `<site-intro>` → Found via glob search in the source tree

### 3. Component Priority

When multiple component types exist for the same name, Tkeron uses this priority:

1. **`.com.ts`** (TypeScript components — highest priority)
2. **`.com.html`** (HTML components)
3. **`.com.md`** (Markdown components — lowest priority)

**Special case:** When both `.com.ts` and `.com.html` exist for the same name, the `.com.html` is loaded as the template (`com.innerHTML`) before the `.com.ts` executes. See [TypeScript Components — HTML Template + TypeScript Logic](./components-typescript.md#html-template--typescript-logic).

If both `hero-text.com.html` and `hero-text.com.md` exist, the `.com.html` version is used and `.com.md` is ignored.

### 4. Build Process

```
Before Build (websrc/index.html):
<hero-text></hero-text>

After Build (web/index.html):
<h1>Welcome</h1>
<p>Some <strong>bold</strong> text</p>
```

The `.com.md` file is NOT copied to output — only its rendered HTML is inlined.

## GFM Features

Markdown components support all GitHub Flavored Markdown extensions out of the box:

### Headings

```markdown
# Heading 1

## Heading 2

### Heading 3
```

### Bold, Italic, Strikethrough

```markdown
**bold text**
_italic text_
~~strikethrough~~
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
```

### Links and Images

```markdown
[Link text](https://example.com)
![Alt text](image.jpg)
```

### Tables

```markdown
| Feature  | Status |
| -------- | ------ |
| Tables   | ✅     |
| Lists    | ✅     |
| Headings | ✅     |
```

### Blockquotes

```markdown
> This is a blockquote
> with multiple lines
```

### Code

````markdown
Inline `code` and fenced blocks:

```js
console.log("hello");
```
````

## Basic Examples

### About Section

```markdown
<!-- about-section.com.md -->

## About Us

We are a **small team** building great tools.

- Open source
- Community driven
- Built with love
```

**Usage:**

```html
<about-section></about-section>
```

### Feature List

```markdown
<!-- feature-list.com.md -->

## Features

| Feature     | Description               |
| ----------- | ------------------------- |
| Fast builds | Sub-second build times    |
| Zero config | Works out of the box      |
| Components  | Reusable HTML, TS, and MD |
```

### FAQ Section

```markdown
<!-- faq-section.com.md -->

## Frequently Asked Questions

### How do I install?

Run `bun add -g tkeron` to install globally.

### How do I build?

Run `tk build` in your project directory.

### Where is the output?

Built files go to the `web/` directory.
```

## Nested Components

Markdown components can include other components using HTML custom elements inside the Markdown:

```markdown
<!-- page-content.com.md -->

# Main Content

Here is some introductory text.

<feature-list></feature-list>

And here is the conclusion.
```

The nested `<feature-list>` will be resolved — whether it's a `.com.ts`, `.com.html`, or `.com.md` component.

## When to Use Markdown Components

### ✅ Perfect For

- **Content-heavy sections**: About pages, documentation, FAQs
- **Blog content**: Static blog posts or content blocks
- **Feature descriptions**: Lists of features with formatting
- **Text-heavy UI**: Any section where the content is primarily text

### ❌ Not Ideal For

- **Dynamic content**: Use [TypeScript Components](./components-typescript.md) instead
- **Complex layouts**: Use [HTML Components](./components-html.md) for precise HTML structure
- **Interactive elements**: Markdown produces static HTML only

## Limitations

### ❌ No Dynamic Content

Markdown components are **static**. They can't read attributes or use logic. For dynamic content, use [TypeScript Components](./components-typescript.md).

### ❌ No Circular Dependencies

Components can't include themselves directly or indirectly. Build will fail with a clear error message.

### Maximum Nesting Depth

Components can be nested up to **50 levels** deep.

## Best Practices

### ✅ Use for Content Sections

```markdown
<!-- team-info.com.md -->

## Our Team

We have **10+ engineers** working on this project.

- Backend: 5 engineers
- Frontend: 3 engineers
- DevOps: 2 engineers
```

### ✅ Name Descriptively

```
Good:
- about-section.com.md
- faq-content.com.md
- feature-overview.com.md

Bad:
- text1.com.md
- stuff.com.md
```

### ✅ Combine with Other Component Types

Use Markdown for content, HTML for layout, and TypeScript for dynamic parts:

```
websrc/
├── page-layout.com.html      # Layout structure
├── hero-content.com.md        # Content in Markdown
├── user-greeting.com.ts       # Dynamic greeting
├── index.html
```

```html
<!-- index.html -->
<page-layout></page-layout>
```

```html
<!-- page-layout.com.html -->
<div class="page">
  <user-greeting></user-greeting>
  <hero-content></hero-content>
</div>
```

## Next Steps

- For precise HTML structure, see [**HTML Components**](./components-html.md)
- For dynamic components with logic, see [**TypeScript Components**](./components-typescript.md)
- For build-time transformations, see [**Pre-rendering**](./pre-rendering.md)
- For patterns and tips, see [**Best Practices**](./best-practices.md)
