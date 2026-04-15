import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildIndex, loadSkillReferences, loadSkills } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_ROOT = resolve(__dirname, '../../../skills');

describe('loadSkills against real android/skills', () => {
  it('finds all 6 known skills', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const names = skills.map((s) => s.name).sort();
    expect(names).toEqual(
      [
        'agp-9-upgrade',
        'edge-to-edge',
        'migrate-xml-views-to-jetpack-compose',
        'navigation-3',
        'play-billing-library-version-upgrade',
        'r8-analyzer',
      ].sort(),
    );
  });

  it('parses frontmatter shape consistently across all skills', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    for (const s of skills) {
      expect(s.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(s.description.length).toBeGreaterThan(0);
      expect(s.frontmatter.metadata.author).toBe('Google LLC');
      expect(Array.isArray(s.keywords)).toBe(true);
      expect(s.keywords.length).toBeGreaterThan(0);
      expect(s.category).toMatch(/^(build|jetpack-compose|navigation|performance|play|system)$/);
    }
  });

  it('extracts headings from each skill body', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    for (const s of skills) {
      // every skill has at least one heading
      expect(s.headings.length).toBeGreaterThan(0);
    }
  });

  it('extracts reference paths and they are loadable', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
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

  it('edge-to-edge has zero references (self-contained)', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const e2e = skills.find((s) => s.name === 'edge-to-edge');
    expect(e2e).toBeDefined();
    expect(e2e?.references).toHaveLength(0);
  });
});

describe('buildIndex semantic-ish search', () => {
  it('returns migrate-xml-views-to-jetpack-compose for "xml to compose"', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const idx = buildIndex(skills);
    const hits = idx.search('xml to compose');
    expect(hits[0]?.name).toBe('migrate-xml-views-to-jetpack-compose');
  });

  it('returns r8-analyzer for "proguard rules"', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const idx = buildIndex(skills);
    const hits = idx.search('proguard rules');
    expect(hits.map((h) => h.name)).toContain('r8-analyzer');
  });

  it('returns edge-to-edge for "status bar overlap"', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const idx = buildIndex(skills);
    const hits = idx.search('status bar');
    expect(hits.map((h) => h.name)).toContain('edge-to-edge');
  });

  it('returns navigation-3 for "deep links"', async () => {
    const skills = await loadSkills(SKILLS_ROOT);
    const idx = buildIndex(skills);
    const hits = idx.search('deep links');
    expect(hits.map((h) => h.name)).toContain('navigation-3');
  });
});
