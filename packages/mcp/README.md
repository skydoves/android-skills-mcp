<h1 align="center">android-skills-mcp</h1></br>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"/></a>
  <a href="https://nodejs.org"><img alt="Node" src="https://img.shields.io/badge/Node-20%2B-brightgreen.svg"/></a>
  <a href="https://modelcontextprotocol.io"><img alt="MCP" src="https://img.shields.io/badge/MCP-1.29-orange.svg"/></a>
</p>

`android-skills-mcp` is an MCP server that exposes Google's [`android/skills`](https://github.com/android/skills) library to any MCP capable client. The server speaks stdio, ships a bundled snapshot of the skills, and boots in under 200 ms.

You add the server once per machine. After that, any project you open in Claude Code, Cursor, Codex CLI, or any other MCP client can search and pull the right skill on demand.

## How to install

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

## Tools

The server registers three tools. Each one returns JSON encoded text content so the model can parse it directly.

| Tool | Arguments | Returns |
|---|---|---|
| `list_skills` | `category?`, `limit?` | All available skills, optionally filtered by category. |
| `search_skills` | `query`, `k?` | BM25 ranked matches across name, keywords, description, and headings. |
| `get_skill` | `name`, `include_references?` | The full `SKILL.md`. With `include_references=true`, every linked reference file is appended at the end. |

The server also lists every skill as a resource at `skill://<name>` for clients (like Claude Code) that surface them in an `@` picker.

## Flags

```
--skills-dir <path>   Re-parse skills from a directory of SKILL.md files
                      instead of the bundled snapshot.
--bundle <path>       Use a specific skills.json snapshot.
--version, -v
--help, -h
```

The default behavior uses a snapshot of `android/skills` bundled at publish time. Pass `--skills-dir` to point at a fresher checkout or an internal fork.

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
