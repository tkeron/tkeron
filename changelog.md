# v4.0.0-beta.1

## Milestone: Beta Release 🎉
- **Transition from alpha to beta**
  - All core features implemented and stable
  - 143 tests passing with comprehensive coverage
  - Complete documentation and examples
  - Ready for wider testing and feedback

## Core Features (Stable)
- ✅ Project initialization with `tk init`
- ✅ Build system with TypeScript bundling
- ✅ Development server with hot reload
- ✅ Pre-rendering with `.pre.ts` files
- ✅ HTML components with `.com.html` files
- ✅ TypeScript components with `.com.ts` files
- ✅ 7 comprehensive examples

# v4.0.0-alpha.10

## New Features
- **Add `init` command for project initialization**
  - Create new tkeron projects with `tk init <projectName>` or `tk i`
  - Initialize in current directory with `tk init .`
  - Interactive prompt when tkeron files already exist
  - Force overwrite with `force=true` option
  - Only removes tkeron files (src/, web/, tkeron.d.ts), preserves other files
  - Scaffolds complete project structure with all feature examples
  - Includes template with pre-rendering, HTML components, and TypeScript components
  - Automatically copies type declarations (tkeron.d.ts)
  - Comprehensive test coverage with 16 passing tests

## Template Content
- Hero section with gradient background
- Interactive counter component
- Multiple component examples (HTML and TypeScript)
- Pre-rendering demonstration
- Favicon and profile image assets
- Ready-to-use development setup

## Documentation
- README updated to reflect `init` command availability
- Comprehensive template showcasing all tkeron features

# v4.0.0-alpha.9

## Breaking Changes
- **Change default output directory from `webout` to `web`**
  - All build and develop commands now output to `web/` by default instead of `webout/`
  - Users can still specify a custom output directory using the `targetDir` parameter
  - Updated all tests and examples to use the new default directory
  - Updated `.gitignore` to ignore `**/web/` instead of `**/webout/`

# v4.0.0-alpha.8

## New Features
- Add `.com.ts` TypeScript component system for dynamic HTML generation
  - Components with full TypeScript logic at build time
  - Access to `com` variable representing the HTML element
  - Read attributes with `com.getAttribute()`
  - Modify content with `com.innerHTML`
  - Import external modules and use npm packages
  - Execute before `.com.html` components (higher priority)
  - Support for nested components and local/root resolution
  - Complete test coverage with 26 tests

## Implementation Details
- Integrated `processComTs()` into build pipeline before `.com.html` processing
- Uses `Bun.spawn()` to execute component TypeScript files
- Temporary output files for communication between processes
- Proper error handling with stderr capture
- Circular dependency detection

## Examples
- Add `with_com_ts/` example demonstrating:
  - Attribute-based components (`user-card.com.ts`)
  - Array/iteration logic (`dynamic-list.com.ts`)
  - Dynamic data and calculations (`greeting-message.com.ts`)

## Documentation
- Update README with `.com.ts` documentation and examples
- Add comprehensive README for `with_com_ts` example
- Document component priority: `.com.ts` > `.com.html`

# v4.0.0-alpha.7

## New Features
- Add `.com.html` component system for HTML reusability
  - Create reusable HTML components with `.com.html` files
  - Custom elements (with hyphens) automatically replaced with component content
  - Support for nested components
  - Local component resolution: prioritizes components in same directory, falls back to root
  - Circular dependency detection to prevent infinite loops
  - Complete substitution: components replace the entire custom element (not just innerHTML)

## Implementation Details
- Integrated `processCom()` into build pipeline after `.pre.ts` processing
- Uses `@tkeron/html-parser` for DOM manipulation
- Filters `.com.html` files from final output
- Normalizes DOCTYPE in HTML output for consistency

## Testing
- Add comprehensive test suite with 18 test cases in `processCom.test.ts`
- Tests cover: basic substitution, nested components, circular dependencies, edge cases
- Validates component resolution priority (local vs root)
- Performance testing with 50+ components

# v4.0.0-alpha.6

## Breaking Changes
- Remove `tkeron_library/` from project - never used in alpha versions
  - The UI library will be available as a separate package `@tkeron/ui` in the future
  - Current focus: CLI build tool with pre-rendering capabilities
  - No impact on existing users as the library was not documented or used in examples

## Documentation
- Clarify project concept: CLI tool for backend-driven frontend development
- Update description to emphasize build-time HTML generation
- Improve `.pre.ts` documentation with clearer backend vs frontend distinction
- Remove "microframework" terminology - tkeron is a build tool

# v4.0.0-alpha.5

## Bug Fixes
- Fix incorrect import path for develop module (moved from root to src/)
- Add shebang to index.ts for proper CLI execution
- Fix develop.test.ts import path after module reorganization
- Update package.json script from "start" to "tk"

## Improvements
- Reorganize project structure: move develop.ts to src/ directory
- Enhance hot reload with Server-Sent Events (SSE) implementation
- Add automatic HTML injection for dev reload script
- Improve reload client management with proper cleanup

# v4.0.0-alpha.4

## New Features
- Add `develop` command for development server with hot reload
  - Live server with automatic rebuild on file changes
  - File system watcher using native `fs.watch`
  - Serves files from output directory
  - Returns `DevelopServer` interface with `stop()` method for cleanup
- Add `develop.ts` module with `TkeronDevOptions` interface

## Testing
- Add integration tests for `develop` command
- Add `develop.test.ts` with E2E tests
- Implement polling-based assertions for more reliable tests
- Add console.log spy for verifying server messages
- Tests run ~12x faster (0.18s vs 2s) with active polling

# v4.0.0-alpha.3

## New Features
- Add `.pre.ts` preprocessing system for HTML manipulation before build
  - Manipulate DOM with TypeScript before final build
  - Support for `querySelector`, `setAttribute`, and other DOM methods
  - Automatic execution of `.pre.ts` files during build process
- Add `processPre` module for handling `.pre.ts` files
- Use temporary directories with UUID for isolated builds
- Automatic cleanup of temporary directories after build

## Improvements
- Use `crypto.randomUUID()` for unique temporary directory names
- Use `fs.cp()` for efficient recursive directory copying
- Use `Bun.spawn()` for isolated `.pre.ts` execution
- Add `with_pre` example demonstrating preprocessing capabilities

## Testing
- Add snapshot tests for build examples
- Add `examples.test.ts` with snapshot validation
- Change test syntax from `test` to `it` (BDD style)
- Use `import.meta.dir` instead of `process.cwd()` (Bun native)
- Use `getFilePaths` from `@tkeron/tools` for recursive file operations
- Add snapshot for `with_pre` example

## Dependencies
- Update `@tkeron/html-parser` with `setAttribute` and `outerHTML` synchronization fix

# v4.0.0-alpha.2

(Previous changes)

# v4.0.0-alpha.1

## ⚠️ Alpha Release - Work in Progress

Complete rewrite from v3. Migration from Node.js to Bun runtime.
Only basic build functionality is available.

## Changes
- Add `build` command with TypeScript bundling and minification
- Migration to Bun runtime (replacing Node.js)
- Add `@tkeron/tools` dependency
- Update `@tkeron/commands` to 0.3.1
- Update tsconfig with DOM types
- Include basic build example

# v3.8.0

- add addScript to send code to the web browser in pre rendered components

# v3.7.1

- add mp3 to loader files

# v3.7.0

- add "with" to tkeron library to handle the component on loaded document

# v3.6.3

- update esbuild version

# v3.6.0

- the "from" method was added to the TkeronElement

# v3.5.0

- update page and component items
- update tsconfig
- upgrade and fix dependencies

# v3.4.0

- update tkeron library
    - Add childs property
    - Add "addChilds" method

# v3.3.0

- update tkeron lilbrary
    - Add and remove classes
    - Refactor for quick "div" creation
    - Add a simple CSS reset


# v3.2.1

- removed path entry to @tkeron.

# v3.2.0

## Breaking changes

- Added a simple library to support component development.
- Modified the tsconfig.json file to use the root directory as a base.
- Also, an index.ts file should be included in the root of the "comps" directory and components should be exported from there. This is to improve the length of component imports.

# v3.1.1

- placed the extensions.d.ts file in the root directory so that vscode recognizes css files, images, html, among others, as modules.

# v3.1.0

## Breaking changes

- the tkeron library and util files was removed, simplify the project.

# v3.0.0

- changed the argument input for the "dev" command to accept named arguments as well.
- moved to version 3 due to issues with npm for pre-3 versions from the early phases of the project.

# v0.0.10

- fix positioned argument outputDir

# v0.0.9

- improve testing

# v0.0.8

- fix cli commands

# v0.0.7

- replace commander for @tkeron/commands.

# v0.0.6

- fixed fetch error.

# v0.0.5

- move to cli directory, action runs on directory changes.

# v0.0.4

- update bundleTs function to allow delete outfile.

# v0.0.3

- fix error in simpleHotRestart script due to undefined "exports" variable.
