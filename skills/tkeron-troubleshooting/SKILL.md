---
name: tkeron-troubleshooting
description: "Troubleshooting tkeron builds and the dev server: common errors with cause-and-fix (Bundle failed, Cannot resolve, missing hyphen, component not replaced, build hangs, websrc not found), dev server singleton recovery after a crash, debugging workflow (read web/, isolate the offending file, check iteration limits), and a quick diagnostic flowchart. Use this skill when a build fails, a component is not inlined, the dev server is down, or output looks wrong."
---

# Tkeron — Troubleshooting

## Diagnostic Flowchart

```
Something is wrong
│
├─ Build fails with an error message?            → "Common Build Errors" section
├─ Build succeeds but output is wrong?           → "Output Looks Wrong" section
├─ Dev server is down / hot reload not working?  → "Dev Server Recovery" section
├─ Test fails?                                   → see tkeron-testing → "Common Test Failures"
└─ Type error in IDE only?                       → "IDE vs Build" section
```

---

## Common Build Errors

### `Bundle failed` / `Cannot resolve "./index.js"`

**Cause**: HTML references `.js` but the source is `.ts`.

```html
<!-- ❌ -->
<script src="index.js"></script>

<!-- ✅ -->
<script type="module" src="./index.ts"></script>
```

### `Cannot resolve "/styles.css"`

**Cause**: absolute path in a `<link rel="stylesheet">`. Two problems: the path is absolute (Bun resolves from the source file, not the server root), and `<link rel="stylesheet">` is itself an anti-pattern in tkeron.

**Fix**: replace the `<link>` with a `<global-styles>` component that inlines the CSS at build time. See `tkeron-patterns` → "CSS via components".

```html
<!-- ❌ BAD -->
<link rel="stylesheet" href="/styles.css" />
<!-- ⚠️ Works but anti-pattern (extra request, no dedup) -->
<link rel="stylesheet" href="./styles.css" />
<!-- ✅ GOOD — inlined, no extra request, dedup-friendly -->
<global-styles></global-styles>
```

### `Component name must contain hyphen`

**Cause**: a `.com.html` / `.com.ts` / `.com.md` whose base name has no hyphen, or collides with a standard HTML tag.

Fix: rename to kebab-case with a hyphen: `card.com.html` → `info-card.com.html`. See `tkeron-organization` for naming rules.

### `Source directory websrc does not exist`

Fix: run `tk init .` to scaffold, or `mkdir websrc` and create at least an `index.html`.

### `Skill files already exist: ...` (from `tk skills`)

Fix: pass `--force` to overwrite, or delete the existing skill folder first.

### `Skills directory not found in tkeron installation`

**Cause**: corrupted or partial install of the `tkeron` package.

Fix: `bun add -g tkeron@latest` (or reinstall locally).

### Build hangs forever

**Cause**: `fetch()` without timeout in `.pre.ts` / `.post.ts` / `.com.ts`. The build event loop waits for the promise.

Fix: always wrap external fetches with `AbortController` + a 5 s timeout. See pattern in `tkeron-patterns`.

### `Maximum iterations reached` (or component loop never settles)

**Cause**: a `.com.ts` keeps emitting the same custom element it is processing, producing infinite expansion. Or two components reference each other circularly.

Fix:

1. Find the component whose `innerHTML` contains its own tag.
2. Break the cycle (emit raw HTML instead of the wrapper, or use a different tag).
3. Limit: 10 iterations, 50 nesting levels — exceeding either aborts the build.

---

## Output Looks Wrong

### A component tag is still in `web/index.html`

```html
<!-- Final output still shows: -->
<user-card></user-card>
```

Causes (in order of frequency):

1. **File name mismatch**: tag is `<user-card>` but file is `userCard.com.html` or `usercard.com.html`. Tkeron is case-insensitive but expects matching kebab-case.
2. **Wrong extension**: file ends in `.html` instead of `.com.html`.
3. **File outside `websrc/`**: tkeron only scans `websrc/`.
4. **Typo**: `<user-cards>` vs `user-card.com.html`.

Verify:

```bash
ls websrc/**/*.com.* | grep -i user-card
grep -rn "<user-card" websrc/
```

### A `.com.ts` runs but `com.innerHTML` is empty in output

**Cause**: the `.com.ts` did not assign `com.innerHTML`. Only `com.innerHTML` survives — `textContent`, `appendChild`, `setAttribute` on `com` itself are all discarded.

```typescript
// ❌ — discarded
com.textContent = "hi";
com.appendChild(document.createElement("span"));

// ✅ — preserved
com.innerHTML = `<span>hi</span>`;
```

### A `<script>` inside `com.innerHTML` is corrupted in output

**Cause**: the HTML parser re-serializes `innerHTML`, and `<`, `>`, `&` inside script JS get double-escaped.

Fix:

- Avoid comparison operators inside the inline script (`>=`, `<=`, `>`, `<`).
- Use `matchMedia('(min-width: Xpx)')` instead of `window.innerWidth >= X`.
- Move complex logic to a separate browser `.ts` file and only emit a `<script type="module" src="./x.ts"></script>` tag.

### Custom CSS selector targets the wrapper tag and matches nothing

**Cause**: the wrapper tag (`<my-section>`) disappears from the output — only the children of `innerHTML` remain.

Fix: write CSS targeting the class/element you emit **inside** `innerHTML`, never the custom tag. See `tkeron-components` → "wrapper tag disappears".

### `.pre.ts` ran but the page does not reflect it

Checklist:

1. Is the file named EXACTLY `<page>.pre.ts` next to `<page>.html`? Pairing is by file name.
2. Did the script throw silently? Run `tk build` and read the full stderr.
3. Are you querying nodes that don't exist yet because the component loop hasn't run? `.pre.ts` runs BEFORE components — query only what is in the source HTML.

### `.post.ts` ran but did not see component output

Same as above, but reversed: `.post.ts` runs AFTER the component loop, so you CAN query nodes emitted by components. If you can't, check the script name pairs the page, and that you didn't accidentally use `.pre.ts` instead.

### Assets disappeared from `web/`

Check:

1. File names contain spaces? Tkeron silently fails to copy them. Rename to kebab-case.
2. File is inside a `.com.*` or `.pre.ts` pair? Those are excluded from output by design.
3. File has the `.com.html` / `.com.ts` / `.com.md` / `.pre.ts` / `.post.ts` extension? Those are never copied.

---

## Dev Server Recovery

`tk dev` is a **singleton process** per port. The first thing to check is whether it is even running.

### Check status

```bash
fuser 3000/tcp 2>/dev/null
# Empty output → not running
# Has output    → running
```

### Recovery after a crash

`tk dev` can crash when an edit in `websrc/` introduces a compile or syntax error. Steps:

1. Confirm it's down: `fuser 3000/tcp 2>/dev/null` returns empty.
2. Read the terminal where `tk dev` was running — the last lines explain why it crashed.
3. Identify the offending file in `websrc/` (TS error, malformed component, broken import).
4. Fix the file.
5. Relaunch **in background**:
   ```bash
   tk dev
   ```
   (In agent sessions, this MUST be an async terminal — `tk dev` blocks indefinitely.)
6. Confirm it is up: `fuser 3000/tcp 2>/dev/null` returns output.

### Port already in use

```
Error: listen EADDRINUSE :::3000
```

Cause: another `tk dev` (or another process) holds port 3000.

```bash
fuser -k 3000/tcp   # kill the holder
# OR launch on a different port:
tk dev 3001
```

### Hot reload not firing

1. Browser tab too old (before the reload script was injected) → hard refresh once (`Ctrl+Shift+R`).
2. SSE connection blocked by a proxy/extension → check DevTools → Network → `/dev-reload` should be `text/event-stream`, status `200`, hanging open.
3. The watcher missed the file (rare on network volumes / Docker bind mounts) → restart `tk dev`.

### `tk dev` blocks the agent terminal

`tk dev` runs forever by design. In agent sessions:

- ALWAYS launch it as an async terminal (background mode).
- NEVER run it synchronously — it will time out and leave a zombie.
- Use `fuser 3000/tcp 2>/dev/null` as the readiness check, not a sleep.

---

## Debugging Workflow

When something is wrong, follow this order:

1. **Reproduce with `tk build`** (not `tk dev`) — it's deterministic and gives full stderr.
2. **Read `web/<page>.html`** — does the component appear unprocessed? Are scripts referenced as `.js`?
3. **Isolate**: comment out custom elements one by one to find the offender.
4. **Strip to minimum**: replace the suspect `.com.ts` body with `com.innerHTML = "OK";` and rebuild — confirms whether the file is even loaded.
5. **Check naming**: file name vs tag name (kebab-case, hyphen, no collisions with standard HTML).
6. **Check pairing**: `.pre.ts` / `.post.ts` must share the base name with the `.html`.
7. **Check imports**: relative paths, no `.js` extensions for source TS files imported from build-time scripts.

---

## IDE vs Build

The IDE can show errors that the build does not (and vice versa):

| Symptom                                 | What it means                                                    |
| --------------------------------------- | ---------------------------------------------------------------- |
| IDE: red squiggle on `com`              | `tkeron.d.ts` missing or not in `tsconfig.json` `include`.       |
| IDE: red squiggle on `document` in .pre | Same as above for the `*.pre.ts` declaration.                    |
| Build: passes but IDE shows type errors | Tkeron does NOT type-check. Run `bun x tsc --noEmit` to confirm. |
| Build: fails with a TS-looking error    | It's a Bun **compile** error, not a type error — fix the syntax. |

Recommended pre-commit / CI step:

```bash
bun x tsc --noEmit && tk build
```

---

## Last-Resort Reset

If the project is in a weird state (stale temp dirs, mismatched output):

```bash
# Remove the output and any leftover temp build dirs
rm -rf web/ .tktmp_*
tk build
```

`getBuildResult` cleans its own temp dirs (`.tktmp_buildresult-*`), but a hard-killed build can leave them behind. They are always siblings of `websrc/`.
