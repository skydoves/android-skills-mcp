# MCP Server: Tools

The server registers three tools. The model picks which one to call. All three return JSON encoded text content so the model can parse the result directly.

## list_skills

Lists every available skill, optionally filtered by category.

| Argument | Type | Required | Default | Description |
|---|---|---|---|---|
| `category` | string | no | `null` | Filter by category folder (e.g. `build`, `jetpack-compose`, `navigation`, `performance`, `play`, `system`). |
| `limit` | integer | no | `50` | Max results. Bounded by the catalog size. |

The response is an array of objects, each with `name`, `category`, `description`, and `keywords`.

```json
[
  {
    "name": "edge-to-edge",
    "category": "system",
    "description": "Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge support and troubleshoot common issues.",
    "keywords": ["android", "compose", "system bars", "edge-to-edge", "status bar", "navigation bar"]
  }
]
```

Use this when the user asks an open ended Android question and you want to discover what curated guidance exists. Prefer `search_skills` when you have a specific query.

## search_skills

Full text search across name, keywords, description, and headings. Uses BM25 ranking with field boosts (name 5x, keywords 3x, description 2x, headings 1x).

| Argument | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | yes | | Search query, keywords or natural language. |
| `k` | integer | no | `5` | Number of results to return. |

The response is an array of ranked hits, each with `name`, `score`, `description`, `category`, `keywords`, and `snippet`.

```json
[
  {
    "name": "migrate-xml-views-to-jetpack-compose",
    "score": 57.01,
    "description": "Provides a structured workflow for migrating an Android XML View to Jetpack Compose...",
    "category": "jetpack-compose",
    "keywords": ["Jetpack Compose", "migration", "XML", "Views", "interoperability", "incremental adoption", "UI development"],
    "snippet": "This skill guides through the process of migrating an existing Android XML View to Jetpack Compose..."
  }
]
```

Call this **before** answering any non-trivial Android question. The curated skills carry the canonical Google guidance and will outrank general training data.

## get_skill

Returns the full `SKILL.md` for a named skill. With `include_references=true`, every linked reference file is appended at the end.

| Argument | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | yes | | Skill name in kebab-case (e.g. `edge-to-edge`). |
| `include_references` | boolean | no | `false` | If true, inline all referenced files at the end. |

The response is a markdown text block. The frontmatter is preserved at the top so the model can read `name`, `description`, and `metadata.keywords` if needed.

```markdown
---
name: edge-to-edge
description: |-
  Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge support...
license: Complete terms in LICENSE.txt
metadata:
  author: Google LLC
  keywords:
    - android
    - compose
---

## Prerequisites
...
```

If the requested skill does not exist, the response sets `isError: true` and lists the available names so the model can self correct.

## Tool selection patterns

Three common flows emerge in practice.

**Open ended exploration.** The user asks "what Android tasks can you help with?" The model calls `list_skills` (no args), reads the catalog, and presents options.

**Targeted lookup.** The user asks a specific question. The model calls `search_skills` with a query derived from the user's intent, then calls `get_skill` on the top hit.

**Deep dive.** The user is in the middle of a task and needs the supporting context. The model calls `get_skill` with `include_references=true` to pull in every referenced doc, then proceeds.
