# Packager CLI: Examples

A few common workflows for using the packager.

## Bootstrap a new Android project

```bash
mkdir my-android-app
cd my-android-app
git init
npx android-skills-pack install --target all
git add .claude .cursor .github .gemini .junie .continue CONVENTIONS.md
git commit -m "chore: install android-skills rules for every supported AI tool"
```

After this, anyone on the team using any of the seven supported tools gets the same Google curated guidance.

## Pin a single tool

If your team standardizes on Cursor:

```bash
npx android-skills-pack install --target cursor
```

Commit `.cursor/rules/`.

## Filter to relevant skills

Most projects do not need every skill. Trim down to what you actually use:

```bash
# A Compose-only app that does not use Play Billing or Navigation 3
npx android-skills-pack install --target cursor --skill edge-to-edge,migrate-xml-views-to-jetpack-compose,r8-analyzer
```

## Run in CI to keep skills fresh

Add a workflow that runs the packager weekly and opens a pull request when the upstream catalog changes:

```yaml
# .github/workflows/sync-skills.yml
name: Sync android-skills

on:
  schedule:
    - cron: '0 9 * * 1'  # Mondays at 09:00 UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npx -y android-skills-pack@latest install --target cursor --force
      - uses: peter-evans/create-pull-request@v6
        with:
          commit-message: 'chore: sync android-skills'
          branch: chore/sync-android-skills
          title: 'Sync android-skills'
```

## Use a fork or internal catalog

Fork `android/skills` to add company specific skills, then point the packager at your fork:

```bash
git clone https://github.com/your-org/internal-android-skills /tmp/our-skills
npx android-skills-pack install --target cursor --skills-dir /tmp/our-skills
```

The packager treats your fork the same way as upstream, as long as the layout follows agentskills.io.

## Combine with the MCP server

The packager and MCP server are independent, but they work well together. Install the MCP server once per machine for ad hoc queries, and use the packager to commit the rules your CI relies on:

```bash
# Once per machine
claude mcp add android-skills -- npx -y android-skills-mcp

# Once per repository
npx android-skills-pack install --target cursor
```

The MCP server keeps your workflow fast for one off questions. The committed rules guarantee everyone on the team and every CI run uses the same canonical guidance.
