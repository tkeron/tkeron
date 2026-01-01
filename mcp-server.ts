#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { init } from "./src/init";
import { build } from "./src/build";
import { develop } from "./src/develop";

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

// Get examples directory
const getExamplesDir = () => {
  if (import.meta.dir) {
    const examplesPath = join(import.meta.dir, "examples");
    if (existsSync(examplesPath)) {
      return examplesPath;
    }
  }
  
  const currentFile = import.meta.url ? fileURLToPath(import.meta.url) : __filename;
  const currentDir = dirname(currentFile);
  return join(currentDir, "examples");
};

const EXAMPLES_DIR = getExamplesDir();

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
          uri: doc.uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  } catch (error) {
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
      },
      {
        name: "list_examples",
        description: "List all available Tkeron example projects with their descriptions",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_example",
        description: "Get the source code and structure of a specific Tkeron example project",
        inputSchema: {
          type: "object",
          properties: {
            example: {
              type: "string",
              description: "Example name (e.g., 'basic_build', 'with_component_iteration')"
            }
          },
          required: ["example"]
        }
      },
      {
        name: "tkeron_init",
        description: "Initialize a new Tkeron project with the standard structure (websrc/ directory with sample files)",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Absolute path where the project will be created"
            },
            force: {
              type: "boolean",
              description: "Overwrite existing files if they exist",
              default: false
            }
          },
          required: ["projectPath"]
        }
      },
      {
        name: "tkeron_build",
        description: "Build a Tkeron project (processes .pre.ts, .com.html, and .com.ts files)",
        inputSchema: {
          type: "object",
          properties: {
            sourceDir: {
              type: "string",
              description: "Absolute path to source directory (default: websrc/)"
            },
            targetDir: {
              type: "string",
              description: "Absolute path to output directory (default: web/)"
            }
          },
          required: []
        }
      },
      {
        name: "tkeron_develop",
        description: "Start Tkeron development server with hot reload",
        inputSchema: {
          type: "object",
          properties: {
            sourceDir: {
              type: "string",
              description: "Absolute path to source directory (default: websrc/)"
            },
            outputDir: {
              type: "string",
              description: "Absolute path to output directory (default: web/)"
            },
            port: {
              type: "number",
              description: "Port number for dev server (default: 3000)",
              default: 3000
            },
            host: {
              type: "string",
              description: "Host for dev server (default: localhost)",
              default: "localhost"
            }
          },
          required: []
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
  
  if (name === "list_examples") {
    try {
      const examples = readdirSync(EXAMPLES_DIR)
        .filter(name => {
          const examplePath = join(EXAMPLES_DIR, name);
          // Accept both src/ and websrc/ directories (init_sample uses websrc/)
          return statSync(examplePath).isDirectory() && 
                 (existsSync(join(examplePath, "src")) || existsSync(join(examplePath, "websrc")));
        });
      
      const exampleDescriptions: { [key: string]: string } = {
        "init_sample": "Complete starter template with all features (used by 'tk init')",
        "basic_build": "Simple HTML + TypeScript bundling",
        "with_assets": "HTML in multiple directories with asset references",
        "with_pre": "Pre-rendering HTML at build time with .pre.ts files",
        "with_com_html_priority": "Static HTML components (.com.html) with local override priority",
        "with_com_ts_priority": "TypeScript components (.com.ts) with local override priority",
        "with_com_mixed_priority": "Mixed .com.html and .com.ts showing processing order",
        "with_component_iteration": "Component iteration: .com.ts with logic, .com.html for templates"
      };
      
      const exampleList = examples.map(name => ({
        name,
        description: exampleDescriptions[name] || "No description available",
        path: `examples/${name}`
      }));
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(exampleList, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing examples: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
  
  if (name === "get_example") {
    const exampleName = (args as any).example;
    const examplePath = join(EXAMPLES_DIR, exampleName);
    
    if (!existsSync(examplePath)) {
      return {
        content: [
          {
            type: "text",
            text: `Example not found: ${exampleName}`
          }
        ]
      };
    }
    
    try {
      // init_sample uses websrc/, others use src/
      let srcPath = join(examplePath, "src");
      if (!existsSync(srcPath)) {
        srcPath = join(examplePath, "websrc");
      }
      
      if (!existsSync(srcPath)) {
        return {
          content: [
            {
              type: "text",
              text: `Example ${exampleName} does not have a src or websrc directory`
            }
          ]
        };
      }
      
      // Read all files in src directory recursively
      const readDirRecursive = (dir: string, baseDir: string = dir): { [key: string]: string } => {
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
      
      const sourceFiles = readDirRecursive(srcPath);
      
      const result = {
        example: exampleName,
        path: `examples/${exampleName}`,
        files: sourceFiles
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading example: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
  
  if (name === "tkeron_init") {
    const projectPath = (args as any).projectPath;
    const force = (args as any).force || false;
    
    try {
      await init({
        projectName: projectPath,
        force,
        promptFn: async () => force // Auto-confirm if force is true
      });
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Tkeron project initialized at ${projectPath}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error initializing project: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
  
  if (name === "tkeron_build") {
    const sourceDir = (args as any).sourceDir;
    const targetDir = (args as any).targetDir;
    
    try {
      await build({ sourceDir, targetDir });
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Build complete! Output: ${targetDir || 'web/'}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error building project: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
  
  if (name === "tkeron_develop") {
    const sourceDir = (args as any).sourceDir;
    const outputDir = (args as any).outputDir;
    const port = (args as any).port || 3000;
    const host = (args as any).host || "localhost";
    
    try {
      const server = await develop({ sourceDir, outputDir, port, host });
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Development server started at http://${server.host}:${server.port}\n\n⚠️ Note: Server is running in the background. Use the returned server object to stop it later.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error starting development server: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
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
