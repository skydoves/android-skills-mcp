<h1 align="center">Android Skills MCP</h1></br>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"/></a>
  <a href="https://nodejs.org"><img alt="Node" src="https://img.shields.io/badge/Node-20%2B-brightgreen.svg"/></a>
  <a href="https://github.com/android/skills"><img alt="Built on android/skills" src="https://img.shields.io/badge/built%20on-android%2Fskills-3DDC84.svg"/></a>
  <a href="https://github.com/skydoves"><img alt="Profile" src="https://skydoves.github.io/badges/skydoves.svg"/></a>
</p>

Android Skills MCP wraps Google's [`android/skills`](https://github.com/android/skills) library so any AI coding assistant can use it without copy and paste. The repository ships two tools that share a common parser and a bundled snapshot of the upstream skills, so both work offline through `npx`.

You get an MCP server that exposes the skill library to any MCP capable client, and a packager CLI that converts each `SKILL.md` into the native rules format of every major AI coding assistant.

Full documentation lives at **[skydoves.github.io/android-skills-mcp](https://skydoves.github.io/android-skills-mcp/)**.

## Packages

This is a pnpm workspace with three packages:

- **[`android-skills-mcp`](packages/mcp)** is an MCP server. It speaks stdio, ships three tools (`list_skills`, `search_skills`, `get_skill`), and exposes every skill as a `skill://` resource. Any MCP client (Claude Code, Cursor, Codex CLI, Windsurf) can discover and pull the right skill on demand.
- **[`android-skills-pack`](packages/pack)** is a CLI. It converts the upstream `SKILL.md` files into seven native rules formats (Claude Code, Cursor, GitHub Copilot, Gemini Code Assist, JetBrains Junie, Continue.dev, Aider) and writes them into your project.
- **[`@android-skills/core`](packages/core)** is the shared library used by both. It parses `SKILL.md` frontmatter with `gray-matter`, validates against the [agentskills.io](https://agentskills.io/specification) spec via `zod`, and builds a BM25 index with `minisearch`.

## How to install the MCP server

You need this once per machine. Every project you open afterwards can use the skills.

### Claude Code

```bash
claude mcp add android-skills -- npx -y android-skills-mcp
```

### Cursor

Add an entry to `.cursor/mcp.json`:

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

### Other MCP clients

Anywhere you can register an MCP server with a stdio command, run:

```
npx -y android-skills-mcp
```

The bundled snapshot loads in under 200 ms, so the cost of spawning the server per session is negligible.

## How to install skills as files

If you prefer rules files committed to your repository over an MCP server, the packager CLI writes them directly. You can pick a single target or `all`:

```bash
npx android-skills-pack install --target cursor
npx android-skills-pack install --target claude-code
npx android-skills-pack install --target copilot
npx android-skills-pack install --target all
```

You can also filter to a specific skill:

```bash
npx android-skills-pack install --target cursor --skill edge-to-edge
npx android-skills-pack install --target claude-code --skill edge-to-edge,r8-analyzer
```

The full list of supported targets:

| Target | Output | Notes |
|---|---|---|
| `claude-code` | `.claude/skills/<name>/SKILL.md` | Near 1:1 copy with references kept as separate files. |
| `cursor` | `.cursor/rules/<name>.mdc` | `description` plus `alwaysApply: false` frontmatter; references inlined. |
| `copilot` | `.github/instructions/<name>.instructions.md` | `applyTo: "**"` frontmatter. |
| `gemini` | `.gemini/styleguide.md` | Single concatenated file with `## <skill>` sections. |
| `junie` | `.junie/skills/<name>/SKILL.md` | JetBrains Junie supports the agentskills.io spec natively. |
| `continue` | `.continue/rules/<name>.md` | `name`, `description`, `alwaysApply` frontmatter. |
| `aider` | `CONVENTIONS.md` (repo root) | Single file. Add `read: CONVENTIONS.md` to `.aider.conf.yml`. |

## Repository layout

```
android-mcp/
├── packages/
│   ├── core/   @android-skills/core   parser, schema, search index
│   ├── mcp/    android-skills-mcp     MCP server (stdio)
│   └── pack/   android-skills-pack    packager CLI
├── scripts/    sync-skills.mjs, build-skills-index.mjs
└── skills/     upstream android/skills clone (gitignored)
```

The `skills/` directory is a plain clone of `android/skills` and is gitignored. You only need it for development. Both published packages bundle a parsed snapshot of the skills inside `dist/skills.json`, so end users never need the upstream repository.

## Development

Clone, install, and run the test suite:

```bash
git clone https://github.com/skydoves/android-skills-mcp.git
cd android-mcp
pnpm install
pnpm sync:skills
pnpm build
pnpm test
```

The build runs in topological order: `core` first, then `mcp` and `pack` in parallel. Each package has its own `vitest` suite. The full test count is 64 across the three packages.

You can smoke test the MCP server over stdio without any client:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | node packages/mcp/dist/bin.js
```

## Find this repository useful?

Support it by joining **[stargazers](https://github.com/skydoves/android-skills-mcp/stargazers)** on this repository. Also, follow **[skydoves](https://github.com/skydoves)** on GitHub for more open source projects.

## License

```
Designed and developed by 2026 skydoves (Jaewoong Eum)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
