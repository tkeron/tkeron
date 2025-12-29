#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Resolve the docs directory - handle both direct execution and symlink execution
const getDocsDir = () => {
  // Try import.meta.dir first (Bun specific)
  if (import.meta.dir) {
    const docsPath = join(import.meta.dir, "docs");
    if (existsSync(docsPath)) {
      return docsPath;
    }
  }
  
  // Fallback: resolve from the actual file location
  const currentFile = import.meta.url ? fileURLToPath(import.meta.url) : __filename;
  const currentDir = dirname(currentFile);
  return join(currentDir, "docs");
};

const DOCS_DIR = getDocsDir();

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
];

const server = new Server(
  {
    name: "tkeron-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: DOCS.map((doc) => ({
      uri: doc.uri,
      name: doc.name,
      description: doc.description,
      mimeType: "text/markdown",
    })),
  };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const uri = request.params.uri;
    const doc = DOCS.find((d) => d.uri === uri);

    if (!doc) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    const filePath = join(DOCS_DIR, doc.file);
    
    // Check if file exists before reading
    if (!existsSync(filePath)) {
      throw new Error(`Documentation file not found: ${doc.file}`);
    }
    
    const content = readFileSync(filePath, "utf-8");

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[tkeron-mcp] Error reading resource:`, errorMessage);
    throw error;
  }
});

// Tools handler - provide a simple tool to keep VS Code happy
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_tkeron_docs",
        description: "Get Tkeron documentation. Available topics: overview, getting-started, components-html, components-typescript, pre-rendering, cli-reference, best-practices",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Documentation topic to retrieve",
              enum: [
                "overview",
                "getting-started",
                "components-html",
                "components-typescript",
                "pre-rendering",
                "cli-reference",
                "best-practices"
              ]
            }
          },
          required: ["topic"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "get_tkeron_docs") {
    const topic = (args as any).topic;
    const doc = DOCS.find(d => d.uri === `tkeron://${topic}`);
    
    if (!doc) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown topic: ${topic}`
          }
        ]
      };
    }
    
    const filePath = join(DOCS_DIR, doc.file);
    const content = readFileSync(filePath, "utf-8");
    
    return {
      content: [
        {
          type: "text",
          text: content
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  try {
    console.error(`[tkeron-mcp] Starting server...`);
    console.error(`[tkeron-mcp] Docs directory: ${DOCS_DIR}`);
    console.error(`[tkeron-mcp] Available resources: ${DOCS.length}`);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error(`[tkeron-mcp] Server started successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[tkeron-mcp] Fatal error:`, errorMessage);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[tkeron-mcp] Unhandled error:`, error);
  process.exit(1);
});
