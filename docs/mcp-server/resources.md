# MCP Server: Resources

In addition to the three tools, the server exposes every skill as a resource at the URI `skill://<name>`. Resources are application controlled, meaning the client decides what to load, while tools are model controlled. Some clients (like Claude Code) surface resources in an `@` picker so you can paste a skill into the conversation by hand.

## URI template

```
skill://<name>
```

Where `<name>` is the kebab-case skill identifier. For example:

| URI | Skill |
|---|---|
| `skill://edge-to-edge` | The edge to edge migration skill. |
| `skill://r8-analyzer` | The R8 keep rules analyzer. |
| `skill://navigation-3` | The Navigation 3 setup and migration skill. |

## resources/list

The server returns every skill as a resource entry:

```json
{
  "resources": [
    {
      "uri": "skill://agp-9-upgrade",
      "name": "agp-9-upgrade",
      "title": "agp-9-upgrade",
      "description": "Upgrades, or migrates, an Android project to use Android Gradle Plugin (AGP) version 9.",
      "mimeType": "text/markdown"
    }
  ]
}
```

Six resources match the six upstream skills. The list grows as upstream adds more.

## resources/read

Reading a resource returns the full `SKILL.md` (frontmatter plus body) as `text/markdown`:

```json
{
  "contents": [
    {
      "uri": "skill://edge-to-edge",
      "mimeType": "text/markdown",
      "text": "---\nname: edge-to-edge\n..."
    }
  ]
}
```

This is the same content `get_skill` returns without `include_references`. Resources do not support arguments, so there is no resource equivalent of `include_references=true`. Use the `get_skill` tool when you need that.

## When to use resources vs tools

| Need | Use |
|---|---|
| Let the model decide which skill to pull | Tool: `search_skills` then `get_skill` |
| Let the user manually attach a skill via `@` picker | Resource: `skill://<name>` |
| Pull a skill plus all its references | Tool: `get_skill` with `include_references=true` |

Most clients (Cursor especially) lean on tools over resources, so the tool surface is the primary path.
