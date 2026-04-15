<h1 align="center">android-skills-pack</h1></br>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"/></a>
  <a href="https://nodejs.org"><img alt="Node" src="https://img.shields.io/badge/Node-20%2B-brightgreen.svg"/></a>
</p>

`android-skills-pack` is a CLI that converts Google's [`android/skills`](https://github.com/android/skills) into the native rules format of every major AI coding assistant. It writes the files directly into your project so you can commit them.

You point it at a target tool, and the CLI emits the right file layout with the right frontmatter for that tool. The published package bundles a snapshot of the skills, so you can run it through `npx` without cloning anything.

## How to install

You can install all skills for a single tool, or split across many:

```bash
npx android-skills-pack install --target cursor
npx android-skills-pack install --target claude-code
npx android-skills-pack install --target copilot
npx android-skills-pack install --target all
```

You can also filter to specific skills:

```bash
npx android-skills-pack install --target cursor --skill edge-to-edge
npx android-skills-pack install --target claude-code --skill edge-to-edge,r8-analyzer
```

## Targets

The CLI ships seven target adapters. Each one knows where to write, what frontmatter to attach, and whether to inline references or keep them as separate files.

| Target | Output | Notes |
|---|---|---|
| `claude-code` | `.claude/skills/<name>/SKILL.md` | Near 1:1 copy with references kept as separate files. |
| `cursor` | `.cursor/rules/<name>.mdc` | `description` plus `alwaysApply: false` frontmatter; references inlined. |
| `copilot` | `.github/instructions/<name>.instructions.md` | `applyTo: "**"` frontmatter. |
| `gemini` | `.gemini/styleguide.md` | Single concatenated file with `## <skill>` sections. |
| `junie` | `.junie/skills/<name>/SKILL.md` | JetBrains Junie supports the agentskills.io spec natively. |
| `continue` | `.continue/rules/<name>.md` | `name`, `description`, `alwaysApply` frontmatter. |
| `aider` | `CONVENTIONS.md` (repo root) | Single file. Add `read: CONVENTIONS.md` to `.aider.conf.yml`. |

## Commands

```bash
android-skills-pack list
android-skills-pack install --target <id>[,<id>...] [options]
```

### Options for `install`

| Flag | Description |
|---|---|
| `--target <id>` | Required. One id, comma separated list, or `all`. |
| `--skill <names>` | Comma separated skill names (default: all). |
| `--out <path>` | Override the target's default output directory. |
| `--dry-run` | Print what would be written without touching disk. |
| `--force` | Overwrite existing files. |
| `--skills-dir <path>` | Re-parse from a directory instead of the bundled snapshot. |
| `--bundle <path>` | Use a specific `skills.json` snapshot. |

## Examples

```bash
# All skills, just for Cursor
npx android-skills-pack install --target cursor

# One skill, for Claude Code
npx android-skills-pack install --target claude-code --skill edge-to-edge

# Multi target, see what would change first
npx android-skills-pack install --target cursor,copilot --dry-run
```

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
