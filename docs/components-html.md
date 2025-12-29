# HTML Components

HTML components (`.com.html` files) are the simplest way to create reusable pieces of markup in Tkeron. They're pure HTML that gets inlined at build time.

## Quick Start

Create a file named with `.com.html` extension:

```html
<!-- button.com.html -->
<button class="btn">Click me</button>
```

Use it with a matching custom element:

```html
<!-- index.html -->
<button></button>
```

Build, and the custom element is replaced with the component's content.

## How They Work

### 1. Component Naming

Component filenames must:
- End with `.com.html`
- Match the custom element name (without `.com.html`)
- Use lowercase with hyphens

**Examples:**

| Filename | Custom Element | Valid? |
|----------|---------------|--------|
| `user-card.com.html` | `<user-card>` | ✅ Yes |
| `nav-menu.com.html` | `<nav-menu>` | ✅ Yes |
| `header.com.html` | `<header>` | ❌ No (no hyphen) |
| `UserCard.com.html` | `<user-card>` | ✅ Yes (case-insensitive) |

### 2. Component Resolution

Tkeron looks for components in this order:

1. **Same directory** as the file using it
2. **Root directory** (`websrc/`)

**Example structure:**

```
websrc/
├── index.html
├── header.com.html          # Available to all files
├── blog/
│   ├── post.html
│   └── comment.com.html     # Available only to blog/post.html
```

In `blog/post.html`:
- `<comment>` → Finds `blog/comment.com.html` first
- `<header>` → Falls back to `websrc/header.com.html`

### 3. Build Process

```
Before Build (websrc/index.html):
<user-card></user-card>

After Build (web/index.html):
<div class="card">...</div>
```

The `.com.html` file is NOT copied to output - only its content is inlined.

## Basic Examples

### Simple Card Component

```html
<!-- card.com.html -->
<div class="card">
  <div class="card-body">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </div>
</div>
```

**Usage:**

```html
<card></card>
<card></card>
```

**Output:**

```html
<div class="card">
  <div class="card-body">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </div>
</div>
<div class="card">
  <div class="card-body">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </div>
</div>
```

### Header Component

```html
<!-- site-header.com.html -->
<header class="site-header">
  <div class="container">
    <h1 class="logo">My Website</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>
</header>
```

**Usage:**

```html
<!DOCTYPE html>
<html>
<body>
  <site-header></site-header>
  <main>
    <!-- Page content -->
  </main>
</body>
</html>
```

### Footer Component

```html
<!-- page-footer.com.html -->
<footer class="page-footer">
  <p>&copy; 2025 My Company. All rights reserved.</p>
  <div class="social-links">
    <a href="https://twitter.com/...">Twitter</a>
    <a href="https://github.com/...">GitHub</a>
  </div>
</footer>
```

## Nested Components

Components can use other components:

```html
<!-- user-avatar.com.html -->
<div class="avatar">
  <img src="/avatars/default.jpg" alt="User">
</div>
```

```html
<!-- user-card.com.html -->
<div class="user-card">
  <user-avatar></user-avatar>
  <div class="user-info">
    <h3>John Doe</h3>
    <p>Software Developer</p>
  </div>
</div>
```

```html
<!-- index.html -->
<user-card></user-card>
```

**Build result:**

```html
<div class="user-card">
  <div class="avatar">
    <img src="/avatars/default.jpg" alt="User">
  </div>
  <div class="user-info">
    <h3>John Doe</h3>
    <p>Software Developer</p>
  </div>
</div>
```

## Multiple Elements in Components

Components can contain multiple root elements:

```html
<!-- two-columns.com.html -->
<div class="column">
  <h2>Column 1</h2>
  <p>Content for column 1</p>
</div>
<div class="column">
  <h2>Column 2</h2>
  <p>Content for column 2</p>
</div>
```

**Usage:**

```html
<div class="row">
  <two-columns></two-columns>
</div>
```

**Output:**

```html
<div class="row">
  <div class="column">
    <h2>Column 1</h2>
    <p>Content for column 1</p>
  </div>
  <div class="column">
    <h2>Column 2</h2>
    <p>Content for column 2</p>
  </div>
</div>
```

## Styling Components

### Inline Styles

```html
<!-- alert-box.com.html -->
<div style="padding: 1rem; background: #fef2f2; border: 1px solid #ef4444; border-radius: 4px;">
  <strong>Error:</strong> Something went wrong!
</div>
```

### With CSS Classes

Components work with your existing CSS:

```html
<!-- product-card.com.html -->
<div class="product-card">
  <img class="product-image" src="/products/placeholder.jpg" alt="Product">
  <h3 class="product-title">Product Name</h3>
  <p class="product-price">$99.99</p>
  <button class="btn btn-primary">Add to Cart</button>
</div>
```

Define styles in your regular CSS file:

```css
/* styles.css */
.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

## Limitations

### ❌ No Dynamic Content

HTML components are **static**. They can't:

- Read or use attributes
- Change based on data
- Have conditional logic
- Loop to generate content

**This won't work:**

```html
<!-- card.com.html -->
<div class="card">
  <!-- Can't access attributes! -->
  <h3>{title}</h3>
  <p>{description}</p>
</div>
```

**Solution:** Use [TypeScript Components](./components-typescript.md) for dynamic content.

### ❌ No Slots or Shadow DOM

HTML components don't support:

- Content projection (slots)
- Shadow DOM encapsulation
- Web Components API

**This won't work:**

```html
<!-- wrapper.com.html -->
<div class="wrapper">
  <slot></slot> <!-- Not supported -->
</div>
```

### ❌ No Circular Dependencies

Components can't include themselves:

```html
<!-- menu.com.html -->
<ul>
  <li>Item 1</li>
  <menu></menu> <!-- ERROR: Circular dependency! -->
</ul>
```

Build will fail with a clear error message showing the circular chain.

### Maximum Nesting Depth

Components can be nested up to **50 levels** deep. Deeper nesting will be ignored with a warning.

## Best Practices

### ✅ Use for Static UI Patterns

Perfect for:
- Headers and footers
- Navigation menus
- Card layouts
- Button styles
- Alert boxes
- Icon sets

### ✅ Keep Components Small

```html
<!-- Good: Small, focused component -->
<!-- icon-warning.com.html -->
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M12 2L1 21h22L12 2z"/>
  <text x="12" y="17" text-anchor="middle">!</text>
</svg>
```

### ✅ Name Descriptively

```
Good:
- user-profile-card.com.html
- nav-menu-item.com.html
- blog-post-header.com.html

Bad:
- component1.com.html
- thing.com.html
- temp.com.html
```

### ✅ Organize by Feature

```
websrc/
├── navigation/
│   ├── nav-menu.com.html
│   ├── nav-item.com.html
│   └── nav-dropdown.com.html
├── cards/
│   ├── product-card.com.html
│   ├── user-card.com.html
│   └── info-card.com.html
```

### ❌ Don't Use for Dynamic Content

If your component needs attributes or logic, use [TypeScript Components](./components-typescript.md) instead:

```typescript
// user-badge.com.ts
const name = com.getAttribute('name') || 'Guest';
const role = com.getAttribute('role') || 'User';
com.innerHTML = `<span class="badge">${name} - ${role}</span>`;
```

## Debugging

### Component Not Found

If your component isn't replaced:

1. **Check filename:** Must be `name.com.html`
2. **Check element:** Must be `<name>` with hyphen
3. **Check location:** In same directory or root `websrc/`

### Component Not Rendering

View the build output to see what was generated:

```bash
tk build
cat web/index.html
```

If the custom element is still there, the component file wasn't found.

### Verify Component Content

Test by temporarily adding unique text:

```html
<!-- test-component.com.html -->
<div>TEST COMPONENT LOADED</div>
```

Build and check if "TEST COMPONENT LOADED" appears in output.

## Real-World Examples

### Blog Post Card

```html
<!-- blog-card.com.html -->
<article class="blog-card">
  <img src="/blog/placeholder.jpg" alt="Blog post" class="blog-card-image">
  <div class="blog-card-content">
    <time class="blog-card-date">2025-01-15</time>
    <h2 class="blog-card-title">Blog Post Title</h2>
    <p class="blog-card-excerpt">
      This is a preview of the blog post content...
    </p>
    <a href="/blog/post" class="blog-card-link">Read more →</a>
  </div>
</article>
```

### Pricing Table

```html
<!-- pricing-card.com.html -->
<div class="pricing-card">
  <div class="pricing-header">
    <h3>Pro Plan</h3>
    <div class="pricing-price">
      <span class="price-amount">$29</span>
      <span class="price-period">/month</span>
    </div>
  </div>
  <ul class="pricing-features">
    <li>✓ Feature 1</li>
    <li>✓ Feature 2</li>
    <li>✓ Feature 3</li>
  </ul>
  <button class="pricing-cta">Get Started</button>
</div>
```

### Loading Spinner

```html
<!-- loading-spinner.com.html -->
<div class="spinner-container">
  <div class="spinner">
    <div class="spinner-circle"></div>
  </div>
  <p class="spinner-text">Loading...</p>
</div>
```

## Next Steps

- For dynamic components with attributes and logic, see [**TypeScript Components**](./components-typescript.md)
- For build-time HTML transformations, see [**Pre-rendering**](./pre-rendering.md)
- For component patterns and tips, see [**Best Practices**](./best-practices.md)
