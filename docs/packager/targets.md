# Packager CLI: Targets

The CLI ships seven target adapters. Each one knows where to write, what frontmatter to attach, and whether to inline references or keep them as separate files.

## Summary

| Target | Output | Files per skill | Frontmatter |
|---|---|---|---|
| `claude-code` | `.claude/skills/<name>/` | 1 + N references | `name`, `description`, `license`, `allowed-tools` |
| `cursor` | `.cursor/rules/<name>.mdc` | 1 (refs inlined) | `description`, `alwaysApply: false` |
| `copilot` | `.github/instructions/<name>.instructions.md` | 1 (refs inlined) | `applyTo: "**"` |
| `gemini` | `.gemini/styleguide.md` | 1 file total (concatenated) | none |
| `junie` | `.junie/skills/<name>/` | 1 + N references | `name`, `description`, `license` |
| `continue` | `.continue/rules/<name>.md` | 1 (refs inlined) | `name`, `description`, `alwaysApply: false` |
| `aider` | `CONVENTIONS.md` (repo root) | 1 file total (concatenated) | none |

## claude-code

Writes `.claude/skills/<name>/SKILL.md` plus a sibling `references/` directory mirroring upstream. This is the closest 1:1 copy because Claude Code already implements the agentskills.io spec.

```
.claude/skills/
├── edge-to-edge/
│   └── SKILL.md
└── navigation-3/
    ├── SKILL.md
    └── references/
        └── android/
            └── guide/
                └── navigation/
                    └── ...
```

The frontmatter keeps `name`, `description`, `license`, and `allowed-tools` (when present). Other metadata fields are dropped because Claude Code does not consume them.

## cursor

Writes `.cursor/rules/<name>.mdc`. Cursor does not support a references directory, so every reference file is inlined at the end of the `.mdc` under a `## references/<path>` heading.

```yaml
---
description: |-
  Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge support...
alwaysApply: false
---

## Prerequisites
...

---

# Inlined references

## references/foo.md

...
```

`alwaysApply: false` means Cursor treats the rule as Agent Requested, so the model picks it up only when the description matches the user's question.

## copilot

Writes `.github/instructions/<name>.instructions.md`. The `applyTo: "**"` frontmatter (quoted to be valid YAML) means the rule applies to every file in the repository.

```yaml
---
applyTo: "**"
---

# edge-to-edge

## Prerequisites
...
```

References are inlined at the end, like the cursor target.

## gemini

Concatenates every skill into a single `.gemini/styleguide.md` with `## <skill name>` section headers. Gemini Code Assist does not support per skill scoping, so the styleguide is always on.

```markdown
# Android skill style guide

This document is generated from android/skills...

---

## edge-to-edge

_Use this skill to migrate your Jetpack Compose app..._

## Prerequisites
...

---

## navigation-3

_Learn how to install and migrate to Jetpack Navigation 3..._
...
```

The file is large (around 500 KB with all references inlined). Trim it manually if your context budget is tight, or use `--skill` to install only the skills you actually need.

## junie

JetBrains Junie supports the agentskills.io spec natively under `.junie/skills/<name>/SKILL.md`. The output is identical in structure to the claude-code target: one directory per skill with a `references/` sibling.

The frontmatter emits `name`, `description`, and `license`. Junie's tooling reads the rest from the body.

## continue

Writes `.continue/rules/<name>.md`. The frontmatter contains `name`, `description`, and `alwaysApply: false`. Continue uses the description for its Agent Requested flow.

```yaml
---
name: edge-to-edge
description: Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge support...
alwaysApply: false
---

## Prerequisites
...
```

## aider

Writes a single `CONVENTIONS.md` at the repository root. This matches Aider's `read:` convention. After installing, add it to your `.aider.conf.yml`:

```yaml
read: CONVENTIONS.md
```

The file structure mirrors the gemini target: every skill as a `## <name>` section with references inlined.

## How references are handled

Some skills link to supporting documentation at `references/<path>.md`. The packager handles them in two ways:

| Strategy | Targets | Behavior |
|---|---|---|
| **Mirror** | claude-code, junie | Keep the original layout. Each reference becomes a sibling file under the skill's directory. |
| **Inline** | cursor, copilot, gemini, continue, aider | Append every reference to the end of the main file under `## references/<path>` headings. |

The choice is dictated by what each target supports. Claude Code and Junie understand the spec's `references/` layout natively. The other tools only support a single file per rule, so the packager flattens.
