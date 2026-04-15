# Skill Catalog

The current snapshot bundled in both packages contains six skills from upstream `android/skills`. The catalog grows as upstream adds more.

## build

### `agp-9-upgrade`

Upgrades, or migrates, an Android project to use Android Gradle Plugin (AGP) version 9.

Covers the migration from older AGP versions: built in Kotlin support, BuildConfig changes, KSP/KAPT differences, the Paparazzi adjustments for Gradle 9, and the recipes for fixing common breakages.

References include AGP 9.0.0 release notes, the migrate-to-built-in-Kotlin guide, BuildConfig docs, KSP/KAPT docs, the Paparazzi notes, and the recipe collection.

## jetpack-compose

### `migrate-xml-views-to-jetpack-compose`

Provides a structured workflow for migrating an Android XML View to Jetpack Compose.

Walks through ten steps: identifying the optimal candidate, project analysis, planning, capturing the baseline UI, setting up Compose dependencies, theming, layout migration, validation, replacing usages, and removing the old XML.

References cover candidate identification, project and layout analysis, theme migration, the views-in-compose interop API, the compose-in-views interop API, dependency setup, and the layout migration playbook.

## navigation

### `navigation-3`

Learn how to install and migrate to Jetpack Navigation 3, and how to implement features like animations, deep links, and modular setups using Hilt or Koin.

Covers Navigation 3 from first install through advanced patterns. References include the Navigation 3 index, the migration guide, type safe destinations, and recipes for animations, basic setup, basic DSL, basic saveable, bottomsheet, common UI, conditional, deep links (basic and advanced), dialogs, list-detail layouts (Material), supporting pane, modular Hilt, modular Koin, multiple back stacks, passing arguments, results via event, results via state, and scene based list-detail and two pane layouts.

## performance

### `r8-analyzer`

Analyzes Android build files and R8 keep rules to identify redundancies, broad patterns, and unnecessary reflection rules.

References cover R8 configuration, the keep rules impact hierarchy, redundant rules, the reflection guide, and the enable-app-optimization performance topic.

## play

### `play-billing-library-version-upgrade`

Use this skill when upgrading or migrating an Android project from any legacy Google Play Billing Library version to the current one.

References include the full release notes, migration logic, and a version checklist.

## system

### `edge-to-edge`

Use this skill to migrate your Jetpack Compose app to add adaptive edge to edge support and troubleshoot common issues.

Covers fixing UI components (like buttons or lists) that are obscured by or overlapping with the navigation bar or status bar, fixing IME insets, and fixing system bar legibility. This is the only skill in the current catalog that is fully self contained (no external references).

## How to refresh

Both published packages bundle the snapshot at publish time. To use a fresher upstream than what's bundled, point the MCP server at a local clone:

```bash
git clone https://github.com/android/skills.git /tmp/skills
npx android-skills-mcp --skills-dir /tmp/skills
```

Or for the packager:

```bash
npx android-skills-pack install --target cursor --skills-dir /tmp/skills
```

The catalog auto syncs to whatever is in the directory you point at.
