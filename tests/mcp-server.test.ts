import { describe, it, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const projectRoot = join(import.meta.dir, "..");
const docsDir = join(projectRoot, "docs");

// Configuration that matches the actual MCP server
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

// Simulate ListResources handler logic
function listResources() {
  return {
    resources: DOCS.map((doc) => ({
      uri: doc.uri,
      name: doc.name,
      description: doc.description,
      mimeType: "text/markdown",
    })),
  };
}

// Simulate ReadResource handler logic
function readResource(uri: string) {
  const doc = DOCS.find((d) => d.uri === uri);

  if (!doc) {
    throw new Error(`Unknown resource: ${uri}`);
  }

  const filePath = join(docsDir, doc.file);

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
}

// Simulate ListTools handler logic
function listTools() {
  return {
    tools: [
      {
        name: "get_tkeron_docs",
        description:
          "Get Tkeron documentation. Available topics: overview, getting-started, components-html, components-typescript, pre-rendering, cli-reference, best-practices",
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
                "best-practices",
              ],
            },
          },
          required: ["topic"],
        },
      },
    ],
  };
}

// Simulate CallTool handler logic
function callTool(name: string, topic: string) {
  if (name !== "get_tkeron_docs") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const doc = DOCS.find((d) => d.uri === `tkeron://${topic}`);

  if (!doc) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown topic: ${topic}`,
        },
      ],
    };
  }

  const filePath = join(docsDir, doc.file);
  const content = readFileSync(filePath, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

describe("MCP Server - Resource Listing", () => {
  it("should return all 7 documentation resources", () => {
    const result = listResources();
    expect(result.resources.length).toBe(7);
  });

  it("should return resources with valid MCP structure", () => {
    const result = listResources();

    for (const resource of result.resources) {
      expect(resource.uri).toBeDefined();
      expect(resource.uri.startsWith("tkeron://")).toBe(true);
      expect(resource.name).toBeDefined();
      expect(resource.name.length).toBeGreaterThan(0);
      expect(resource.description).toBeDefined();
      expect(resource.description.length).toBeGreaterThan(0);
      expect(resource.mimeType).toBe("text/markdown");
    }
  });

  it("should have unique URIs", () => {
    const result = listResources();
    const uris = result.resources.map((r) => r.uri);
    const uniqueUris = new Set(uris);
    expect(uniqueUris.size).toBe(result.resources.length);
  });

  it("should match expected resource names", () => {
    const result = listResources();
    const names = result.resources.map((r) => r.name);

    expect(names).toContain("Tkeron Overview");
    expect(names).toContain("Getting Started");
    expect(names).toContain("HTML Components");
    expect(names).toContain("TypeScript Components");
    expect(names).toContain("Pre-rendering");
    expect(names).toContain("CLI Reference");
    expect(names).toContain("Best Practices");
  });
});

describe("MCP Server - Resource Reading", () => {
  it("should read existing resource successfully", () => {
    const result = readResource("tkeron://overview");

    expect(result.contents.length).toBe(1);
    expect(result.contents[0]!.uri).toBe("tkeron://overview");
    expect(result.contents[0]!.mimeType).toBe("text/markdown");
    expect(result.contents[0]!.text.length).toBeGreaterThan(100);
  });

  it("should read all documented resources successfully", () => {
    for (const doc of DOCS) {
      const result = readResource(doc.uri);

      expect(result.contents[0]!.uri).toBe(doc.uri);
      expect(result.contents[0]!.text.length).toBeGreaterThan(100);
    }
  });

  it("should throw error for unknown URI", () => {
    expect(() => {
      readResource("tkeron://non-existent");
    }).toThrow("Unknown resource");
  });

  it("should return valid markdown content", () => {
    const result = readResource("tkeron://overview");
    const content = result.contents[0]!.text;

    expect(content).toContain("#");
  });

  it("should read actual file content from disk", () => {
    const result = readResource("tkeron://getting-started");
    const content = result.contents[0]!.text;

    // Verify it contains expected sections
    expect(content).toContain("Installation");
    expect(content).toContain("tk");
  });
});

describe("MCP Server - Tool Listing", () => {
  it("should return get_tkeron_docs tool", () => {
    const result = listTools();

    expect(result.tools.length).toBe(1);
    expect(result.tools[0]!.name).toBe("get_tkeron_docs");
  });

  it("should have valid tool schema", () => {
    const result = listTools();
    const tool = result.tools[0]!;

    expect(tool.description).toBeDefined();
    expect(tool.description.length).toBeGreaterThan(0);
    expect(tool.inputSchema).toBeDefined();
    expect(tool.inputSchema.type).toBe("object");
    expect(tool.inputSchema.properties.topic).toBeDefined();
    expect(tool.inputSchema.required).toContain("topic");
  });

  it("should have all topics in enum", () => {
    const result = listTools();
    const tool = result.tools[0]!;
    const enumValues = tool.inputSchema.properties.topic.enum;

    expect(enumValues).toContain("overview");
    expect(enumValues).toContain("getting-started");
    expect(enumValues).toContain("components-html");
    expect(enumValues).toContain("components-typescript");
    expect(enumValues).toContain("pre-rendering");
    expect(enumValues).toContain("cli-reference");
    expect(enumValues).toContain("best-practices");
    expect(enumValues.length).toBe(7);
  });
});

describe("MCP Server - Tool Execution", () => {
  it("should execute get_tkeron_docs tool successfully", () => {
    const result = callTool("get_tkeron_docs", "overview");

    expect(result.content.length).toBe(1);
    expect(result.content[0]!.type).toBe("text");
    expect(result.content[0]!.text.length).toBeGreaterThan(100);
  });

  it("should work with all valid topics", () => {
    const topics = [
      "overview",
      "getting-started",
      "components-html",
      "components-typescript",
      "pre-rendering",
      "cli-reference",
      "best-practices",
    ];

    for (const topic of topics) {
      const result = callTool("get_tkeron_docs", topic);
      expect(result.content[0]!.text.length).toBeGreaterThan(0);
    }
  });

  it("should return error message for invalid topic", () => {
    const result = callTool("get_tkeron_docs", "invalid-topic");
    expect(result.content[0]!.text).toContain("Unknown topic");
  });

  it("should throw error for unknown tool", () => {
    expect(() => {
      callTool("unknown_tool", "overview");
    }).toThrow("Unknown tool");
  });

  it("should return actual file content via tool", () => {
    const result = callTool("get_tkeron_docs", "cli-reference");
    const content = result.content[0]!.text;

    expect(content).toContain("tk build");
    expect(content).toContain("tk dev");
    expect(content).toContain("tk init");
  });
});

describe("MCP Server - Documentation Files", () => {
  it("should have all documentation files present", () => {
    for (const doc of DOCS) {
      const filePath = join(docsDir, doc.file);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  it("should have non-empty documentation files", () => {
    for (const doc of DOCS) {
      const filePath = join(docsDir, doc.file);
      const content = readFileSync(filePath, "utf-8");
      expect(content.length).toBeGreaterThan(100);
    }
  });
});
