# MCP Server

Tkeron includes a Model Context Protocol (MCP) server that exposes comprehensive documentation to AI agents and development tools.

## What is MCP?

The Model Context Protocol is a standard for providing context to AI agents. Tkeron's MCP server allows AI assistants to access up-to-date documentation about how to use Tkeron, its capabilities, and limitations.

## Installation

The MCP server is included when you install Tkeron globally:

```bash
bun install -g tkeron
```

This installs three commands:
- `tk` / `tkeron` - The main CLI tool
- `tkeron-mcp` - The MCP server

## Configuration

### VS Code

Add to your MCP configuration file (`~/.config/Code/User/mcp.json`):

```json
{
  "servers": {
    "tkeron": {
      "command": "tkeron-mcp"
    }
  }
}
```

If the global command is not found, use Bun directly:

```json
{
  "servers": {
    "tkeron": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/tkeron/mcp-server.ts"]
    }
  }
}
```

**Note:** This is the VS Code format. Other editors (Cursor, Windsurf, etc.) may use different configuration formats.
```

**Find the path:**
```bash
# If tkeron is installed globally
dirname $(which tk)
# Returns something like: /home/user/.bun/bin

# The mcp-server.ts is in the same directory
ls $(dirname $(which tk))/mcp-server.ts
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent on other platforms:

```json
{
  "mcpServers": {
    "tkeron": {
      "command": "tkeron-mcp"
    }
  }
}
```

### Other MCP Clients

Any MCP-compatible client can use the server. Configure it to run:

```bash
tkeron-mcp
```

The server communicates via stdio transport.

## Available Resources

The MCP server exposes the following documentation resources:

| URI | Description |
|-----|-------------|
| `tkeron://overview` | What Tkeron is, what it does, and what it's not |
| `tkeron://getting-started` | Installation, first project, and basic workflow |
| `tkeron://components-html` | Create reusable HTML components with .com.html files |
| `tkeron://components-typescript` | Build dynamic components with .com.ts files |
| `tkeron://pre-rendering` | Transform HTML at build time with .pre.ts files |
| `tkeron://cli-reference` | Complete command-line interface documentation |
| `tkeron://best-practices` | Patterns, anti-patterns, and limitations |

## What AI Agents Can Do

With access to the MCP server, AI agents can:

- ✅ Understand Tkeron's capabilities and limitations
- ✅ Help users create components correctly
- ✅ Suggest appropriate patterns for different use cases
- ✅ Identify when Tkeron is NOT the right tool
- ✅ Provide accurate CLI commands and options
- ✅ Debug common issues with components and pre-rendering
- ✅ Recommend best practices and avoid anti-patterns

## Benefits

### For Users

- Get accurate help from AI assistants
- AI understands your project structure
- Contextual suggestions based on Tkeron's docs
- Fewer mistakes and faster development

### For AI Agents

- Access to authoritative, up-to-date documentation
- Clear understanding of limitations and constraints
- Examples and patterns to reference
- Ability to distinguish between what Tkeron can and can't do

## Verification

To verify the MCP server is working:

1. Install Tkeron globally
2. Configure your MCP client
3. Restart your IDE/editor
4. Ask your AI assistant: "What is Tkeron?"

The assistant should be able to provide an accurate description based on the documentation.

## Troubleshooting

### "Command not found: tkeron-mcp"

Make sure Tkeron is installed globally:

```bash
bun install -g tkeron
which tkeron-mcp
```

### "Cannot find module"

Ensure all dependencies are installed:

```bash
cd $(dirname $(which tkeron-mcp))
bun install
```

### MCP Client Not Connecting

Check your configuration file syntax:
- Valid JSON
- Correct command path
- Proper permissions on the executable

### Resources Not Loading

Verify the docs directory exists:

```bash
ls $(dirname $(which tkeron-mcp))/docs/
```

All markdown files should be present.

## For Developers

### Adding New Resources

To add new documentation resources:

1. Create a new `.md` file in `docs/`
2. Add an entry to the `DOCS` array in `mcp-server.ts`:

```typescript
{
  uri: "tkeron://new-topic",
  name: "New Topic",
  description: "Description of the topic",
  file: "new-topic.md",
}
```

3. Rebuild and publish the package

### Testing Locally

Run the MCP server directly:

```bash
bun run mcp-server.ts
```

It will wait for stdio input (this is normal for MCP servers).

Test with an MCP client or use the MCP inspector tool.

## Related Documentation

- [Overview](./overview.md) - Learn what Tkeron is
- [Getting Started](./getting-started.md) - Start using Tkeron
- [Best Practices](./best-practices.md) - Patterns and anti-patterns
