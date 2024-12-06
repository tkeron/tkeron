# tkeron

**tkeron** is a lightweight microframework designed to streamline web development with TypeScript. Its key features include:

- **CLI for project initialization, page, and component creation.**
- **Simple library for component management**, using functions instead of classes.
- **Exclusive use of TypeScript, HTML, and CSS**, without additional configurations or new syntax.
- **'No magic' philosophy**, where behavior is always explicit and controlled by the developer.

## Main Features

- **Zero Configuration:** Start developing without any additional setup.
- **TypeScript Based:** Leverage language features without learning new syntax.
- **Simplicity:** Easy to understand, focusing on clarity and minimal functionality.
- **Pre-rendering:** Built-in support for static content.
- **Hot Reloading:** Real-time changes during development with the `tk dev` command.

## Installation

Install **tkeron** globally using npm:

```bash
npm i -g tkeron
```

## Usage

Here are some basic examples of how to use the tkeron CLI:

- **Initialize a new project:**

```bash
tk init
```

- **Create a new page:**

```bash
tk g p <name>
```

Example: `tk g p index` would create an initial page.

**Each page generates the following files:**

- **.html** for the page structure.
- **.css** for styling.
- **.page.ts** for client-side logic.
- **.back.ts** for server-side pre-rendering.

## Requirements

- Node.js (currently required).
- Future plans for migrate to Bun.

## Differentiators

**tkeron** stands out for its focus on simplicity, eliminating complex setups and allowing developers to concentrate solely on coding.

## Contributions

Contributions are welcome! Developers can open issues or submit pull requests at [GitHub](https://github.com/tkeron/tkeron).

## Current Status

The project is actively being developed. Roadmap details include:

- Future integration of its own DOM package.
- Full compatibility with Bun.
