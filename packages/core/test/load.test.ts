import { readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { type Skill, buildIndex, loadSkillReferences, loadSkills } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_ROOT = resolve(__dirname, '../../../skills');

// Expectations are derived from the upstream checkout, never from a frozen roster:
// android/skills adds, renames and removes skills between syncs, and every literal
// baked in here turns the weekly sync job red instead of letting it open its PR.
function skillDirsOnDisk(root: string, acc: string[] = []): string[] {
  for (const name of readdirSync(root)) {
    if (name === '.git' || name === 'node_modules' || name === '.github' || name === 'dist') {
      continue;
    }
    const full = join(root, name);
    if (statSync(full).isDirectory()) skillDirsOnDisk(full, acc);
    else if (name === 'SKILL.md') acc.push(dirname(full));
  }
  return acc;
}

const skillDirs = skillDirsOnDisk(SKILLS_ROOT);
const has = (name: string) => skillDirs.some((d) => basename(d) === name);

let skills: Skill[];
beforeAll(async () => {
  skills = await loadSkills(SKILLS_ROOT);
});

describe('loadSkills against real android/skills', () => {
  it('finds every SKILL.md in the upstream tree', () => {
    // Upstream keeps directory name and frontmatter `name` in lockstep, so this
    // catches a skill the walker silently drops without pinning the roster.
    expect(skills.map((s) => s.name).sort()).toEqual(skillDirs.map((d) => basename(d)).sort());
    expect(skills.length).toBeGreaterThan(0);
  });

  it('parses frontmatter shape consistently across all skills', () => {
    for (const s of skills) {
      expect(s.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(s.description.length).toBeGreaterThan(0);
      if (s.frontmatter.metadata.author !== undefined) {
        expect(s.frontmatter.metadata.author).toBe('Google LLC');
      }
      expect(Array.isArray(s.keywords)).toBe(true);
      // category is structural — the first path segment under the skills root —
      // rather than a closed enum upstream has to ask permission to grow.
      expect(s.category).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(s.category).toBe(relative(SKILLS_ROOT, s.path).split(/[\\/]/)[0]);
    }
  });

  it('extracts headings from each skill body', () => {
    for (const s of skills) {
      // every skill has at least one heading
      expect(s.headings.length).toBeGreaterThan(0);
    }
  });

  it('extracts reference paths and they are loadable', () => {
    const skillsWithRefs = skills.filter((s) => s.references.length > 0);
    expect(skillsWithRefs.length).toBeGreaterThanOrEqual(5);
    for (const s of skillsWithRefs) {
      const refs = loadSkillReferences(s);
      for (const ref of refs) {
        expect(ref.relPath.startsWith('references/')).toBe(true);
        expect(ref.content.length).toBeGreaterThan(0);
      }
    }
  });

  it.skipIf(!has('edge-to-edge'))('edge-to-edge has zero references (self-contained)', () => {
    const e2e = skills.find((s) => s.name === 'edge-to-edge');
    expect(e2e).toBeDefined();
    expect(e2e?.references).toHaveLength(0);
  });
});

// Ranking assertions name a specific skill, so they are skipped when upstream
// drops or renames it — a content change upstream must not block a sync.
describe('buildIndex semantic-ish search', () => {
  it.skipIf(!has('migrate-xml-views-to-jetpack-compose'))(
    'returns migrate-xml-views-to-jetpack-compose for "xml to compose"',
    () => {
      const hits = buildIndex(skills).search('xml to compose');
      expect(hits[0]?.name).toBe('migrate-xml-views-to-jetpack-compose');
    },
  );

  it.skipIf(!has('r8-analyzer'))('returns r8-analyzer for "proguard rules"', () => {
    const hits = buildIndex(skills).search('proguard rules');
    expect(hits.map((h) => h.name)).toContain('r8-analyzer');
  });

  it.skipIf(!has('edge-to-edge'))('returns edge-to-edge for "status bar overlap"', () => {
    const hits = buildIndex(skills).search('status bar');
    expect(hits.map((h) => h.name)).toContain('edge-to-edge');
  });

  it.skipIf(!has('navigation-3'))('returns navigation-3 for "deep links"', () => {
    const hits = buildIndex(skills).search('deep links');
    expect(hits.map((h) => h.name)).toContain('navigation-3');
  });
});
