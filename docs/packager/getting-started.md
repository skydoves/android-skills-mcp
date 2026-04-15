# Packager CLI: Getting Started

`android-skills-pack` is a CLI that converts Google's `android/skills` into the native rules format of every major AI coding assistant. It writes the files directly into your project, so you can commit them and review them in pull requests.

## Install

You can run the CLI through `npx` without a global install:

```bash
npx android-skills-pack list
npx android-skills-pack install --target cursor
```

Or install it globally:

```bash
npm install -g android-skills-pack
android-skills-pack install --target cursor
```

## First install

Pick a target tool and run `install`:

```bash
npx android-skills-pack install --target cursor
```

You should see output like:

```
[cursor] wrote 6 file(s) → /your/repo/.cursor/rules
  + /your/repo/.cursor/rules/agp-9-upgrade.mdc (74820B)
  + /your/repo/.cursor/rules/edge-to-edge.mdc (14252B)
  + /your/repo/.cursor/rules/migrate-xml-views-to-jetpack-compose.mdc (50668B)
  + /your/repo/.cursor/rules/navigation-3.mdc (239545B)
  + /your/repo/.cursor/rules/play-billing-library-version-upgrade.mdc (87028B)
  + /your/repo/.cursor/rules/r8-analyzer.mdc (33226B)

Done. 6 written, 0 skipped.
```

Open Cursor's Settings > Rules. The six new rules should appear under Project Rules.

## Multi target install

```bash
npx android-skills-pack install --target cursor,copilot,claude-code
```

You can also install for every supported target:

```bash
npx android-skills-pack install --target all
```

## Filtering skills

By default, every skill is installed. Pass `--skill` to filter:

```bash
npx android-skills-pack install --target cursor --skill edge-to-edge
npx android-skills-pack install --target claude-code --skill edge-to-edge,r8-analyzer
```

## Idempotency

Re-running `install` without `--force` skips files that already exist:

```
[cursor] wrote 0 file(s) → /your/repo/.cursor/rules
  6 skipped (use --force to overwrite):
  - /your/repo/.cursor/rules/edge-to-edge.mdc: exists (use --force to overwrite)

Done. 0 written, 6 skipped.
```

This protects local edits. Pass `--force` to overwrite:

```bash
npx android-skills-pack install --target cursor --force
```

## Dry run

To see what would be written without touching disk, pass `--dry-run`:

```bash
npx android-skills-pack install --target cursor --dry-run
```

The output shows every file that would be created, with sizes, but writes nothing.

## Listing skills

```bash
npx android-skills-pack list
```

Outputs every skill (with category and description) and every supported target. Useful for double checking the catalog before installing.

## What's next?

- [Targets](targets.md) covers each of the seven target adapters: where they write, what frontmatter they emit, and how references are handled.
- [Examples](examples.md) walks through a few common workflows: bootstrapping a new repo, running in CI, and forking the catalog.
