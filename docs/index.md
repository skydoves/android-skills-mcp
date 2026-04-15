# Overview

**Android Skills MCP** wraps Google's [`android/skills`](https://github.com/android/skills) library so any AI coding assistant can use it without copy and paste. The repository ships two complementary tools that share a common parser and a bundled snapshot of the upstream skills, so both work offline through `npx`.

You get an MCP server that exposes the skill library to any MCP capable client, and a packager CLI that converts each `SKILL.md` into the native rules format of every major AI coding assistant.

## Two Components

Android Skills MCP consists of two independent, complementary packages. The **MCP Server** runs in the background and lets any MCP capable client (Claude Code, Cursor, Codex CLI, Windsurf) discover and pull skills on demand. You install it once per machine. The **Packager CLI** writes rules files directly into your project, so you can commit them and review them in pull requests.

| Component | Purpose | When to use |
|---|---|---|
| **MCP Server** | The model decides which skill to pull on demand | Per machine setup. Best when you do Android work in many repositories. |
| **Packager CLI** | Skills as static files committed to your repo | Per project setup. Best when you want skills versioned alongside the code. |

!!! note "Independence"
    The two packages are completely independent. You can use either one alone, or both together. The packager works without the server, and the server works without the packager.

## Quick Start

### MCP Server

```bash
claude mcp add android-skills -- npx -y android-skills-mcp
```

For Cursor, add an entry to `.cursor/mcp.json`:

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

### Packager CLI

```bash
npx android-skills-pack install --target cursor
npx android-skills-pack install --target claude-code
npx android-skills-pack install --target all
```

## Why Use This?

Google's [`android/skills`](https://github.com/android/skills) is the canonical source of step by step guidance for Android tasks (XML to Compose migration, AGP 9 upgrade, R8 keep rule analysis, edge to edge, Navigation 3, Play Billing, and more). It follows the open [agentskills.io](https://agentskills.io) standard and is the closest thing Android has to authoritative AI guidance.

The challenge is delivery. The repository ships markdown files, not configuration for any specific tool. To use a skill in Claude Code you copy it into `.claude/skills/`. For Cursor, you reformat it as a `.mdc` file. For Copilot, you wrap it in `.github/instructions/`. Each tool has a slightly different layout, frontmatter shape, and scoping model. Multiply that by seven tools and six skills and you have forty two manual transformations to keep in sync.

Android Skills MCP closes this gap. The MCP server keeps the model itself in the loop: when you ask an Android question, the model searches the catalog and pulls the right skill. The packager CLI handles the static file path: one command per tool generates the right layout, the right frontmatter, and the right scoping rules.

## What's Inside

| Skill | Category | What it covers |
|---|---|---|
| `agp-9-upgrade` | build | Upgrading or migrating to Android Gradle Plugin 9 |
| `migrate-xml-views-to-jetpack-compose` | jetpack-compose | Step by step XML View to Compose migration |
| `navigation-3` | navigation | Installing and migrating to Jetpack Navigation 3 |
| `r8-analyzer` | performance | Analyzing R8 keep rules to find redundancies and broad patterns |
| `play-billing-library-version-upgrade` | play | Upgrading any legacy Play Billing version to current |
| `edge-to-edge` | system | Migrating a Compose app to adaptive edge to edge support |

The list grows as upstream `android/skills` adds more. Both packages bundle the latest snapshot at publish time.

## Where to next?

- [MCP Server: Getting Started](mcp-server/getting-started.md) covers install across every MCP client and the three tools the server exposes.
- [Packager CLI: Getting Started](packager/getting-started.md) walks through the seven supported targets with example output.
- [Architecture](architecture.md) explains the parser, the schema validator, and the BM25 search index that power both tools.
