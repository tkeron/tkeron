---
name: tkeron-organization
description: "Tkeron project organization: root=sitemap principle, directory layout, where components live, naming conventions for files and components, and the discipline of when to componentize vs leave inline. Use this skill when starting a new tkeron project, restructuring an existing one, naming new files, or deciding whether to extract markup into a component."
---

# Tkeron — Project Organization

## Fundamental Principle: root = sitemap

The root of `websrc/` must be a **faithful image of the final sitemap**. Every `.html` at root or inside a subdirectory maps directly to a route. Components, utils and styles live in dedicated directories that are NOT routes.

```
websrc/
├── index.html                  # → /
├── index.ts                    # Browser JS for /
├── index.pre.ts                # Pre-render for /
├── about.html                  # → /about
├── pricing.html                # → /pricing
│
├── blog/
│   ├── index.html              # → /blog/
│   └── post-template.html      # → /blog/post-template
│
├── docs/
│   ├── index.html              # → /docs/
│   ├── getting-started.html    # → /docs/getting-started
│   └── cli-reference.html      # → /docs/cli-reference
│
├── components/                 # ← NOT a route, only stores components
│   ├── layout/
│   │   ├── site-header.com.html
│   │   ├── site-footer.com.html
│   │   └── page-sidebar.com.html
│   ├── ui/
│   │   ├── info-card.com.html
│   │   ├── user-badge.com.ts
│   │   └── alert-box.com.ts
│   └── content/
│       ├── hero-text.com.md
│       └── about-section.com.md
│
├── styles/                     # OPTIONAL — .css source files (or place them
│   │                              anywhere). Never loaded via <link>; a
│   │                              .com.ts component reads and inlines them.
│   └── main.css                 # Tokens + resets + body typography (small!)
│
└── utils/
    ├── format.ts               # Helpers (imported by .com.ts or .pre.ts)
    └── api-service.ts          # API functions
```

### Principles

- **Root = sitemap**: scanning the root of `websrc/` reveals the URL structure of the site.
- **Components outside root**: ALWAYS in `components/` with subfolders by domain (`layout/`, `ui/`, `content/`).
- Related files for a page stay together (`page.html` + `page.ts` + `page.pre.ts` + `page.post.ts` in the same directory).
- Flat when there are few files, subfolders when it grows.
- Local override components live next to the page that uses them (resolution priority — see `tkeron-components`).

### Why NOT a `pages/` subdirectory

Putting pages inside `pages/` breaks the root = sitemap principle. The routes `/about` and `/contact` must appear as `about.html` and `contact.html` directly at root, not hidden inside `pages/about/about.html`. The root **is** the sitemap.

---

## When to Componentize (and When Not)

Tkeron gives a lot of freedom: you can have no components or turn everything into a component. That freedom requires discipline.

### Golden rule

> A component justifies its existence if it **eliminates real duplication** (2+ uses) or **encapsulates logic** (`.com.ts` with attributes). If it does neither, it is gratuitous indirection.

### ✅ Create a component WHEN

| Situation                                            | Recommended type        |
| ---------------------------------------------------- | ----------------------- |
| Markup shared between 2+ pages (header, footer, nav) | `.com.html`             |
| Dynamic block whose attributes vary per instance     | `.com.ts`               |
| Markdown content referenced from several pages       | `.com.md`               |
| Template + complex logic worth isolating             | `.com.html` + `.com.ts` |

### ❌ Do NOT create a component WHEN

| Situation                                          | Why not                                                 |
| -------------------------------------------------- | ------------------------------------------------------- |
| Used only once, no logic                           | Indirection with no benefit — reading inline is clearer |
| HTML is trivial (2–5 lines)                        | Not worth a file for `<div class="divider"></div>`      |
| "For visual organization" because the page is long | Use sections + comments + indentation inside the HTML   |
| "Might be reused someday"                          | YAGNI — extract when actually needed, not before        |

### The freedom problem — both extremes

```
❌ Bad: bloated HTML, no components
websrc/
├── index.html          ← 400 lines, header/footer/cards duplicated
├── about.html          ← 300 lines, same header/footer/cards copy-paste
└── contact.html        ← 200 lines, same header/footer copy-paste

✅ Fix: extract what is shared
websrc/
├── index.html          ← <site-header>, <info-card>, <site-footer>
├── about.html          ← <site-header>, <info-card>, <site-footer>
├── contact.html        ← <site-header>, <site-footer>
└── components/
    └── layout/
        ├── site-header.com.html
        ├── site-footer.com.html
        └── info-card.com.html
```

```
❌ Bad: over-componentization
websrc/
├── index.html          ← only 8 custom elements, empty HTML
├── hero-section.com.html    ← used 1 time
├── intro-text.com.html      ← used 1 time
├── feature-list.com.html    ← used 1 time
├── cta-block.com.html       ← used 1 time
└── ...
To understand index.html you must open 8 files.

✅ Fix: leave inline what is used once
websrc/
├── index.html          ← full HTML, readable top to bottom
├── components/
│   └── layout/
│       ├── site-header.com.html  ← shared with about.html
│       └── site-footer.com.html  ← shared with about.html
└── about.html
```

---

## Naming

### Components — mandatory hyphen

Every component file MUST produce a tag with a hyphen (HTML custom-elements standard) and MUST NOT collide with a standard HTML tag.

```
✅ GOOD:
user-profile-card.com.html     → <user-profile-card>
nav-menu-item.com.html         → <nav-menu-item>
blog-post-card.com.ts          → <blog-post-card>
social-share-button.com.ts     → <social-share-button>
hero-section.com.md            → <hero-section>

❌ BAD:
card.com.html                  → No hyphen (invalid custom element)
header.com.html                → Standard HTML tag (collision)
button.com.html                → Standard HTML tag (collision)
UserProfile.com.html           → Works but not idiomatic
component1.com.html            → No meaning
btn.com.html                   → Too abbreviated
thing.com.html                 → No clear purpose
```

**Format**: kebab-case, lowercase with hyphens.

### Pages and general files

```
✅ GOOD:
index.html, about.html, blog-post.html
api-service.ts, format-utils.ts
main.css, tokens.css

❌ BAD:
Index.html                     → Always lowercase
About Page.html                → No spaces (tkeron does not handle them)
blog_post.html                 → Hyphens, not underscores
temp.html, test123.html        → No meaning
```

### Assets — no spaces

Tkeron does not handle file names with spaces correctly — the build may fail silently or not copy the asset to the output. Applies to ALL files in `websrc/` (assets, components, scripts).

```
❌ BAD
websrc/assets/my logo.webp
websrc/assets/hero image.png

✅ GOOD — hyphen or underscore
websrc/assets/my-logo.webp
websrc/assets/hero-image.png
```

---

## Where Each File Type Lives

| File                          | Location                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| Pages (`*.html`)              | Root of `websrc/` or sub-route directories — never in `pages/` |
| Per-page scripts (`*.ts`)     | Same directory as the paired `.html`                           |
| Per-page `.pre.ts`/`.post.ts` | Same directory as the paired `.html`                           |
| Shared components             | `websrc/components/<domain>/` (`layout/`, `ui/`, `content/`)   |
| Local-override components     | Same directory as the page that uses them (wins by priority)   |
| Global styles                 | Free choice (root of `websrc/`, a `styles/` folder, next to the loader component). Source `.css` files are NOT loaded via `<link>`; a `.com.ts` reads them and inlines as `<style>` (see `tkeron-patterns` → "CSS via components"). Per-component CSS lives **inside** each `.com.html`. |
| Build-time utils (Bun)        | `websrc/utils/` — imported by `.pre.ts`, `.post.ts`, `.com.ts` |
| Static assets                 | `websrc/assets/` (or wherever — they are copied as-is)         |
| Output                        | `web/` — **NEVER edit, always in `.gitignore`**                |

---

## Excessive Nesting

Components can use other components (Tkeron processes up to 10 iterations), but deep chains are hard to debug.

```
❌ BAD (hard to debug):
page → layout → section → card → header → icon → svg   (7 levels)

✅ GOOD (2–3 levels max):
page.html → site-header.com.html → nav-logo.com.html
```

---

## Quick Checklist Before Committing Structure

1. ✅ Every `.html` at root corresponds to an actual route
2. ✅ Every component lives under `components/<domain>/`, never loose at root
3. ✅ Every component name has a hyphen and is not a standard HTML tag
4. ✅ No file names with spaces, capitals, or underscores (use kebab-case)
5. ✅ Local overrides (same-directory components) are intentional, not accidental
6. ✅ No component is extracted "just in case" — only with 2+ uses or logic
7. ✅ Component chains are ≤ 3 levels deep when possible
