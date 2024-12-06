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
