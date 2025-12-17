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
