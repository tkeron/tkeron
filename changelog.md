# v4.0.0-beta.8

## Bug Fixes

### Pre-rendering Import Resolution
- **Fixed**: `.pre.ts` files now correctly resolve `@tkeron/html-parser` module
- Previously, pre-rendering files executed from a temp directory couldn't find Tkeron's internal html-parser module
- Now uses absolute path to `@tkeron/html-parser` from Tkeron's own `node_modules`
- User project imports (relative paths like `./my-utils`) continue to work normally

## Improvements

### Test Stability
- Introduced `logger` wrapper module to replace direct `console` usage in source files
- Tests now spy on `logger` instead of global `console`, eliminating race conditions in concurrent test execution
- All 170 tests now pass consistently without intermittent failures

### Internal Refactoring
- Migrated all `console.log/error/warn` calls to use centralized `logger` module
- Affected modules: `build`, `develop`, `processPre`, `processCom`, `processComTs`, `buildDir`, `buildEntrypoints`, `init`, `initWrapper`, `banner`

## Maintenance
- Version bump for pre-rendering fix and test infrastructure improvements

# v4.0.0-beta.7

## Improvements

### Error Handling and Validation
- Added comprehensive input validation to core functions (`buildEntrypoints`, `processPre`, `processCom`, `processComTs`, `buildDir`, `build`, `develop`, `initWrapper`) to prevent runtime errors from invalid parameters
- Enhanced error messages in `build` and `develop` commands to include suggestion to use `tk init` when source directory doesn't exist
- Improved `init` command to automatically clean output directories from the project template, ensuring only source files are copied

## Maintenance
- Version bump for new validation features and error handling improvements

# v4.0.0-beta.6

## Bug Fixes
- **MCP Server**
  - Fixed `list_examples` to include `init_sample` (uses `websrc/` instead of `src/`)
  - Fixed `get_example` to handle both `src/` and `websrc/` directories
  - Added `init_sample` to example descriptions list

## Improvements
- **Documentation**
  - Verified all documentation files are present and referenced correctly
  - All MCP server documentation available in `docs/mcp-server.md`

## Maintenance
- Version bump for consistency and preparation for stable release

# v4.0.0-beta.5

## New Features

### Component Iteration System
- **Dynamic data processing in components**
  - Components can now iterate and generate multiple instances with TypeScript logic
  - Added new example: `with_component_iteration` demonstrating:
    - Data fetching and processing in `.com.ts` files
    - Nested component rendering with dynamic attributes
    - Real TypeScript calculations (engagement scores, statistics)
    - Multi-level component iteration (3 levels deep)
  - Components can perform calculations and conditional logic at build time
  - Enables complex data transformations before rendering

### Enhanced MCP Server Capabilities
- **Example project management tools**
  - New `list_examples` tool: Lists all available Tkeron example projects
  - New `get_example` tool: Retrieves source code and structure of examples
  - New `tkeron_init` tool: Initialize Tkeron projects via MCP
  - New `tkeron_build` tool: Build Tkeron projects via MCP
  - New `tkeron_develop` tool: Start development server via MCP
  - AI assistants can now create, build, and run Tkeron projects directly
  
- **Example projects now included in npm package**
  - Removed examples from `.npmignore`
  - All example projects ship with the package
  - Makes it easier for users to explore and learn from examples
  - Enables MCP tools to access and share example code

## Improvements

### Build System
- **Refactored component processing pipeline**
  - Better separation of concerns between HTML and TypeScript components
  - Improved error handling and reporting
  - Cleaner code structure with fewer side effects

### Development Server  
- **Test suite cleanup**
  - Removed unnecessary `setupSigintHandler` test (implementation detail)
  - All 14 remaining tests verify real server behavior
  - Tests use unique ports and directories for parallel execution
  - Improved test reliability and maintainability

### Code Quality
- **Better TypeScript processing**
  - Enhanced pre-rendering with cleaner temp directory handling
  - Improved component substitution logic
  - More robust error handling throughout the codebase

# v4.0.0-beta.4

## New Features
- **MCP Server Integration**
  - Added Model Context Protocol (MCP) server for AI agent integration
  - New `tkeron-mcp` binary command
  - Exposes all documentation via MCP protocol
  - Enables AI assistants to provide accurate help with Tkeron projects
  - Full setup documentation in `docs/mcp-server.md`

## Dependencies
- Added `@modelcontextprotocol/sdk` ^1.25.1 for MCP server functionality

# v4.0.0-beta.3

## New Features
- **Force flag for init command**
  - Added `force=true` option to `tk init` command
  - Allows overwriting existing directories without prompts
  - Usage: `tk init example force=true`
  - Removes and recreates the entire directory when specified
  - Prevents errors when directory already exists
  - Useful for resetting projects or automation scripts

## Improvements
- **Enhanced directory handling in init**
  - Empty directories are now allowed without force flag
  - Only non-empty directories require `force=true` to overwrite
  - Better error messages indicating the correct syntax
  - Current directory (`.`) behavior unchanged - only removes tkeron files

- **Enhanced pre-rendering capabilities**
  - Added cryptocurrency price fetching example (Bitcoin, Ethereum, Solana)
  - Demonstrates real-time API data fetching at build time
  - Added build metadata with tkeron version and Bun runtime info
  - Shows practical use case of external API integration during pre-rendering

- **Improved build system**
  - Changed temp directory location from system `/tmp` to project-sibling `.tmp_*`
  - Preserves relative imports to files outside websrc
  - Enables natural module resolution for external dependencies
  - Added `.tmp_*` to .gitignore
  - Implemented robust cleanup with try-finally to prevent orphaned temp directories

- **Better hot reload**
  - Enhanced EventSource client with automatic reconnection on errors
  - Added error handling to prevent connection failures
  - Improved reliability for consecutive file changes
  - Added console logging for better debugging experience

## Template Updates
- New cryptocurrency prices section in init_sample
- Real-time price display with color-coded 24h changes (green ▲ / red ▼)
- Responsive grid layout for asset cards
- Build metadata footer showing tkeron version, Bun runtime, platform
- Updated quote section with improved styling

# v4.0.0-beta.2

## Bug Fixes
- **Fix default source directory inconsistency**
  - Changed default source directory from `src` to `websrc` for consistency
  - Renamed `init_sample/src` to `init_sample/websrc`
  - Updated `init.ts` to check for `websrc` instead of `src`
  - Updated all test files to use `websrc`
  - Updated documentation (README and changelog) to reflect `websrc` as default
  - Aligns init template with default directories used in build and develop commands

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
