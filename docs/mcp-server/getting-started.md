# MCP Server: Getting Started

`android-skills-mcp` is an MCP server that exposes Google's `android/skills` library to any MCP capable client. It speaks stdio, ships a bundled snapshot of the skills, and boots in under 200 ms.

## Install

You add the server once per machine. After that, any project you open in any supported client can search and pull skills on demand.

### Claude Code

```bash
claude mcp add android-skills -- npx -y android-skills-mcp
```

This writes to `~/.claude.json`. To install at project scope instead, edit `.mcp.json` at your project root:

```json
{
  "mcpServers": {
    "android-skills": {
      "command": "npx",
      "args": ["-y", "android-skills-mcp"]
    }
  }
}
```

### Cursor

Edit `.cursor/mcp.json` at your project root, or `~/.cursor/mcp.json` for a global install:

```json
{
  "mcpServers": {
    "android-skills": {
      "command": "npx",
      "args": ["-y", "android-skills-mcp"]
    }
  }
}
```

### Codex CLI

Add to your Codex MCP config (location varies by version):

```json
{
  "mcpServers": {
    "android-skills": {
      "command": "npx",
      "args": ["-y", "android-skills-mcp"]
    }
  }
}
```

### Windsurf and other MCP clients

Anywhere you can register an MCP server with a stdio command, run:

```
npx -y android-skills-mcp
```

## Verify the install

In your client, ask an Android question. The model should call `search_skills` followed by `get_skill`. For example, in Claude Code:

> How should I migrate my XML views to Jetpack Compose?

You should see Claude invoke `search_skills` with a query like `"xml views to jetpack compose"`, get a top hit of `migrate-xml-views-to-jetpack-compose`, then call `get_skill` to read the full ten step procedure.

## Smoke test the server directly

You can also exercise the server over raw stdio without any client:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | npx -y android-skills-mcp
```

You should see two JSON RPC responses on stdout: the `initialize` response with capabilities, and a `tools/list` response with three tools.

## What the server provides

The server registers three tools and one resource template. See [Tools](tools.md) for the full schema of each tool, and [Resources](resources.md) for how the `skill://` URI scheme works.

| Surface | Count | Purpose |
|---|---|---|
| Tools | 3 | `list_skills`, `search_skills`, `get_skill` |
| Resources | 6 | `skill://<name>` for every skill in the catalog |
