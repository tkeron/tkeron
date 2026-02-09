#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const getBaseDir = () => {
  if (import.meta.dir) {
    return import.meta.dir;
  }
  const currentFile = import.meta.url
    ? fileURLToPath(import.meta.url)
    : __filename;
  return dirname(currentFile);
};

const BASE_DIR = getBaseDir();
const DOCS_DIR = join(BASE_DIR, "docs");
const EXAMPLES_DIR = join(BASE_DIR, "examples");

const getVersion = (): string => {
  const pkgPath = join(BASE_DIR, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version || "0.0.0";
  }
  return "0.0.0";
};

const DOCS = [
  {
    uri: "tkeron://overview",
    name: "Tkeron Overview",
    description: "What tkeron is, what it does, and what it's not",
    file: "overview.md",
  },
  {
    uri: "tkeron://getting-started",
    name: "Getting Started",
    description: "Installation, first project, and basic workflow",
    file: "getting-started.md",
  },
  {
    uri: "tkeron://components-html",
    name: "HTML Components",
    description: "Create reusable HTML components with .com.html files",
    file: "components-html.md",
  },
  {
    uri: "tkeron://components-typescript",
    name: "TypeScript Components",
    description: "Build dynamic components with .com.ts files",
    file: "components-typescript.md",
  },
  {
    uri: "tkeron://pre-rendering",
    name: "Pre-rendering",
    description: "Transform HTML at build time with .pre.ts files",
    file: "pre-rendering.md",
  },
  {
    uri: "tkeron://cli-reference",
    name: "CLI Reference",
    description: "Complete command-line interface documentation",
    file: "cli-reference.md",
  },
  {
    uri: "tkeron://best-practices",
    name: "Best Practices",
    description: "Patterns, anti-patterns, and limitations",
    file: "best-practices.md",
  },
  {
    uri: "tkeron://testing",
    name: "Testing Tkeron Projects",
    description:
      "How to test tkeron projects using getBuildResult(), DOM assertions, and bounded content verification",
    file: "testing.md",
  },
];

const EXAMPLE_DESCRIPTIONS: { [key: string]: string } = {
  init_sample:
    "Complete starter template with all features (used by 'tk init')",
  basic_build: "Simple HTML + TypeScript bundling",
  with_assets: "HTML in multiple directories with asset references",
  with_pre: "Pre-rendering HTML at build time with .pre.ts files",
  with_com_html_priority:
    "Static HTML components (.com.html) with local override priority",
  with_com_ts: "TypeScript components (.com.ts) generating HTML at build time",
  with_com_ts_priority:
    "TypeScript components (.com.ts) with local override priority",
  with_com_mixed_priority:
    "Mixed .com.html and .com.ts showing processing order",
  with_component_iteration:
    "Component iteration: .com.ts with logic, .com.html for templates",
};

const readDirRecursive = (
  dir: string,
  baseDir: string = dir,
): { [key: string]: string } => {
  const files: { [key: string]: string } = {};
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = fullPath.substring(baseDir.length + 1);

    if (statSync(fullPath).isDirectory()) {
      Object.assign(files, readDirRecursive(fullPath, baseDir));
    } else {
      files[relativePath] = readFileSync(fullPath, "utf-8");
    }
  }

  return files;
};

const server = new McpServer({
  name: "tkeron-mcp",
  version: getVersion(),
});

for (const doc of DOCS) {
  server.registerResource(
    doc.name,
    doc.uri,
    { description: doc.description, mimeType: "text/markdown" },
    () => {
      const filePath = join(DOCS_DIR, doc.file);

      if (!existsSync(filePath)) {
        throw new Error(`Documentation file not found: ${doc.file}`);
      }

      const content = readFileSync(filePath, "utf-8");

      return {
        contents: [
          {
            uri: doc.uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      };
    },
  );
}

server.registerTool(
  "list_examples",
  {
    description:
      "List all available Tkeron example projects with their descriptions",
    annotations: { readOnlyHint: true },
  },
  () => {
    const examples = readdirSync(EXAMPLES_DIR).filter((name) => {
      const examplePath = join(EXAMPLES_DIR, name);
      return (
        statSync(examplePath).isDirectory() &&
        (existsSync(join(examplePath, "src")) ||
          existsSync(join(examplePath, "websrc")))
      );
    });

    const exampleList = examples.map((name) => ({
      name,
      description: EXAMPLE_DESCRIPTIONS[name] || "No description available",
      path: `examples/${name}`,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(exampleList, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "get_example",
  {
    description:
      "Get the source code and structure of a specific Tkeron example project",
    inputSchema: {
      example: {
        type: "string",
        description:
          "Example name (e.g., 'basic_build', 'with_component_iteration')",
      },
    } as any,
    annotations: { readOnlyHint: true },
  },
  ({ example: exampleName }: { example: string }) => {
    const examplePath = join(EXAMPLES_DIR, exampleName);

    if (!existsSync(examplePath)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Example not found: ${exampleName}. Use the list_examples tool to see available examples.`,
          },
        ],
        isError: true,
      };
    }

    let srcPath = join(examplePath, "src");
    if (!existsSync(srcPath)) {
      srcPath = join(examplePath, "websrc");
    }

    if (!existsSync(srcPath)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Example ${exampleName} does not have a src or websrc directory`,
          },
        ],
        isError: true,
      };
    }

    const sourceFiles = readDirRecursive(srcPath);

    const result = {
      example: exampleName,
      path: `examples/${exampleName}`,
      files: sourceFiles,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[tkeron-mcp] Server v${getVersion()} started`);
};

main().catch((error) => {
  console.error(`[tkeron-mcp] Fatal error:`, error);
  process.exit(1);
});
