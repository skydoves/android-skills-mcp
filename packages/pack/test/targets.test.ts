import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Skill, loadSkills } from '@android-skills/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { planInstall } from '../src/install.js';
import { TARGETS } from '../src/targets/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, '../../../skills');

let skills: Skill[];
beforeAll(async () => {
  skills = await loadSkills(SKILLS_DIR);
});

describe.each(TARGETS)('target $id', (target) => {
  it('produces non-empty output for all 6 skills', () => {
    const files = target.render(skills);
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      expect(f.relPath).not.toMatch(/^\//);
      expect(f.contents.length).toBeGreaterThan(0);
    }
  });

  it('output paths and sizes match snapshot', () => {
    const files = target.render(skills);
    const summary = files.map((f) => `${f.relPath}\t${Buffer.byteLength(f.contents)}B`).sort();
    expect(summary).toMatchSnapshot();
  });

  it('first 200 chars of every file match snapshot', () => {
    const files = target.render(skills);
    const head = Object.fromEntries(files.map((f) => [f.relPath, f.contents.slice(0, 200)]));
    expect(head).toMatchSnapshot();
  });

  it('plans install with absolute paths under outDir', () => {
    const plan = planInstall({
      target,
      skills,
      outDir: '/tmp/android-skills-test-out',
    });
    expect(plan.outDir).toBe('/tmp/android-skills-test-out');
    for (const f of plan.files) {
      expect(f.absPath.startsWith(plan.outDir)).toBe(true);
    }
  });
});

describe('install constraints', () => {
  it('claude-code emits exactly N+M files (skills + references)', () => {
    const target = TARGETS.find((t) => t.id === 'claude-code')!;
    const files = target.render(skills);
    const expected = skills.length + skills.reduce((sum, s) => sum + s.references.length, 0);
    expect(files.length).toBe(expected);
  });

  it('cursor emits exactly one .mdc per skill', () => {
    const target = TARGETS.find((t) => t.id === 'cursor')!;
    const files = target.render(skills);
    expect(files.length).toBe(skills.length);
    for (const f of files) expect(f.relPath.endsWith('.mdc')).toBe(true);
  });

  it('gemini emits exactly one styleguide.md', () => {
    const target = TARGETS.find((t) => t.id === 'gemini')!;
    const files = target.render(skills);
    expect(files.length).toBe(1);
    expect(files[0]?.relPath).toBe('styleguide.md');
  });

  it('aider emits exactly one CONVENTIONS.md', () => {
    const target = TARGETS.find((t) => t.id === 'aider')!;
    const files = target.render(skills);
    expect(files.length).toBe(1);
    expect(files[0]?.relPath).toBe('CONVENTIONS.md');
  });

  it('cursor frontmatter contains description and alwaysApply', () => {
    const target = TARGETS.find((t) => t.id === 'cursor')!;
    const files = target.render(skills);
    for (const f of files) {
      expect(f.contents.startsWith('---\n')).toBe(true);
      expect(f.contents).toContain('description:');
      expect(f.contents).toContain('alwaysApply: false');
    }
  });

  it('claude-code SKILL.md is re-parseable by core', async () => {
    const target = TARGETS.find((t) => t.id === 'claude-code')!;
    const files = target.render(skills);
    const skillMds = files.filter((f) => f.relPath.endsWith('SKILL.md'));
    const matter = (await import('gray-matter')).default;
    for (const f of skillMds) {
      const parsed = matter(f.contents);
      expect(parsed.data.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof parsed.data.description).toBe('string');
      expect(parsed.content.length).toBeGreaterThan(0);
    }
  });
});
