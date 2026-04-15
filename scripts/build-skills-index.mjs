#!/usr/bin/env node
// Walks ../skills (or --skills-dir), parses each SKILL.md via @android-skills/core,
// writes a JSON snapshot to --out for bundling into the mcp/pack packages.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Resolve @android-skills/core via its built dist file rather than node module
// resolution so this script works whether invoked from the workspace root or
// from any package directory.
const corePath = resolve(__dirname, '../packages/core/dist/index.js');
const { loadSkills } = await import(corePath);

const { values } = parseArgs({
  options: {
    'skills-dir': { type: 'string', default: resolve(repoRoot, 'skills') },
    out: { type: 'string' },
  },
});

if (!values.out) {
  console.error('Usage: build-skills-index.mjs --out <path> [--skills-dir <path>]');
  process.exit(2);
}

const skillsDir = values['skills-dir'];
const outPath = resolve(process.cwd(), values.out);

if (!existsSync(skillsDir)) {
  console.error(`Skills directory not found: ${skillsDir}`);
  console.error('Run `pnpm sync:skills` first.');
  process.exit(1);
}

const skills = await loadSkills(skillsDir);
const skillsRootResolved = resolve(skillsDir);

// Inline reference contents and strip absolute paths so the bundle is portable.
const portable = skills.map((s) => ({
  ...s,
  path: s.path.startsWith(skillsRootResolved)
    ? s.path.slice(skillsRootResolved.length + 1)
    : s.path,
  dir: s.dir.startsWith(skillsRootResolved) ? s.dir.slice(skillsRootResolved.length + 1) : s.dir,
  references: s.references.map((r) => ({
    relPath: r.relPath,
    absPath: r.absPath.startsWith(skillsRootResolved)
      ? r.absPath.slice(skillsRootResolved.length + 1)
      : r.absPath,
    content: existsSync(r.absPath) ? readFileSync(r.absPath, 'utf8') : '',
  })),
}));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(portable, null, 2)}\n`);
console.log(`Wrote ${portable.length} skills → ${outPath}`);
