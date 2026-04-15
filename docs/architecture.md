# Architecture

Android Skills MCP is a pnpm workspace with three packages. The MCP server and the packager CLI each have a thin surface, and both share a common parser plus a search index that lives in `@android-skills/core`.

## Repository layout

```
android-mcp/
├── packages/
│   ├── core/   @android-skills/core   shared parser, schema, search index
│   ├── mcp/    android-skills-mcp     MCP server (stdio)
│   └── pack/   android-skills-pack    packager CLI
├── scripts/    sync-skills.mjs, build-skills-index.mjs
└── skills/     upstream android/skills clone (gitignored)
```

The shared core is intentionally small. It does three things: parse a `SKILL.md`, validate it against the agentskills.io schema, and build a BM25 index over the parsed result.

## How parsing works

The parser reads a `SKILL.md` with `gray-matter`, which splits the YAML frontmatter from the markdown body. The frontmatter is then validated against a `zod` schema that enforces the agentskills.io spec:

```typescript
SkillFrontmatterSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(64),
  description: z.string().min(1).max(1024),
  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),
  'allowed-tools': z.string().optional(),
  metadata: z.object({
    author: z.string().optional(),
    version: z.string().optional(),
    keywords: z.array(z.string()).default([]),
  }).passthrough(),
}).passthrough();
```

The body is scanned for `^#{1,6} ` headings and for relative markdown links pointing at `references/`. Both are extracted into typed arrays. The parser does not load reference contents at this stage; it only collects paths. References are loaded lazily by `loadSkillReferences()` when needed.

## How the search index works

`buildIndex(skills)` wraps `MiniSearch` with a fixed configuration:

| Field | Boost | Source |
|---|---|---|
| `name` | 5 | Skill name |
| `keywords` | 3 | `metadata.keywords` joined with spaces |
| `description` | 2 | Frontmatter description |
| `headings` | 1 | All `^#{1,6} ` headings from the body |

BM25 ranks results. Prefix matching and 20% fuzzy matching are enabled, so partial words and minor typos still match. The index is built once at server startup and held in memory. With six skills and a few hundred terms, the build takes around 10 ms.

The choice of BM25 over embedding based search is deliberate. The catalog is small, the keywords are curated, and the queries are short. BM25 produces better top hits in this regime than dense embeddings, with no model download, no warm up, and no native deps. If the catalog grows past a few hundred skills or if telemetry shows that BM25 misses real queries, embeddings would be a justified upgrade.

## How the MCP server bundles skills

When you `pnpm build` the MCP package, two things happen. First, `tsup` bundles the TypeScript sources into `dist/index.js` and `dist/bin.js`. Second, the build script walks the cloned `skills/` directory, parses every `SKILL.md` via `@android-skills/core`, inlines every reference content, strips absolute paths, and writes the result to `dist/skills.json`.

The published npm package ships `dist/skills.json` alongside the bundled JS. At server startup, the bundle is loaded once, parsed in around 5 ms, and held in memory. There are zero runtime file system reads after startup, and zero network calls.

If you pass `--skills-dir <path>`, the server bypasses the bundle and parses fresh from the directory you point at. This is useful when you fork the upstream catalog or want changes that haven't shipped in a release yet.

## How the packager produces target outputs

The packager's `Target` interface is small:

```typescript
interface Target {
  id: string;
  description: string;
  defaultOutDir(cwd: string): string;
  render(skills: Skill[], ctx?: RenderCtx): RenderedFile[];
}
```

Each of the seven target adapters implements `render`. Some return one file per skill (cursor, copilot, continue, claude-code, junie). Others return a single file (gemini, aider). The `executeInstall` function takes a target's output, resolves paths against an output directory, and writes the files (with idempotency and `--force` support).

YAML emission goes through a small `frontmatter()` helper in `render.ts`. It quotes string values when they would otherwise be misparsed: alias prefixes (`*foo`), embedded colons, reserved keywords (`true`, `null`), and globs (`**`). This is what makes `applyTo: "**"` come out quoted in the copilot target.

Reference handling depends on the target. Claude Code and Junie mirror the layout (one directory per skill with a `references/` sibling). The other targets inline references at the end of the main file under `## references/<path>` headings.

## Testing

The test pyramid:

| Layer | Tests | What it covers |
|---|---|---|
| `@android-skills/core` | 15 | Parser against all 6 real skills, schema invariants, search ranking |
| `android-skills-mcp` | 9 | In-memory MCP transport: `list_skills`, `search_skills`, `get_skill`, resources |
| `android-skills-pack` | 40 | Per-target snapshot tests (paths, sizes, head 200 chars), install lifecycle |

Total 64 tests, all running in around 1.5 seconds. The tests parse the actual upstream `skills/` directory rather than fixtures, so any upstream change that breaks the parser surfaces immediately.

The MCP server tests use the `InMemoryTransport.createLinkedPair()` helper to wire a server and a client in the same process, so the assertions go through the real MCP protocol stack without spawning subprocesses.
