import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Skill, loadSkills } from '@android-skills/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { executeInstall } from '../src/install.js';
import { TARGETS, getTarget } from '../src/targets/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, '../../../skills');

let skills: Skill[];
let tmpRoot: string;

beforeAll(async () => {
  skills = await loadSkills(SKILLS_DIR);
  tmpRoot = mkdtempSync(join(tmpdir(), 'android-skills-pack-'));
});

afterAll(() => {
  if (tmpRoot && existsSync(tmpRoot)) rmSync(tmpRoot, { recursive: true, force: true });
});

describe('executeInstall', () => {
  it('writes files for every target without conflict', () => {
    for (const target of TARGETS) {
      const outDir = join(tmpRoot, target.id);
      const result = executeInstall({ target, skills, outDir });
      expect(result.written.length).toBeGreaterThan(0);
      expect(result.skipped).toEqual([]);
      for (const w of result.written) {
        expect(existsSync(w.absPath)).toBe(true);
        expect(w.bytes).toBeGreaterThan(0);
      }
    }
  });

  it('skips existing files without --force', () => {
    const target = getTarget('cursor')!;
    const outDir = join(tmpRoot, 'cursor-skip');
    const first = executeInstall({ target, skills, outDir });
    expect(first.written.length).toBe(skills.length);
    const second = executeInstall({ target, skills, outDir });
    expect(second.written).toEqual([]);
    expect(second.skipped.length).toBe(skills.length);
  });

  it('overwrites with --force', () => {
    const target = getTarget('cursor')!;
    const outDir = join(tmpRoot, 'cursor-force');
    executeInstall({ target, skills, outDir });
    const second = executeInstall({ target, skills, outDir, force: true });
    expect(second.written.length).toBe(skills.length);
    expect(second.skipped).toEqual([]);
  });

  it('--dry-run writes nothing', () => {
    const target = getTarget('claude-code')!;
    const outDir = join(tmpRoot, 'dry-run');
    const result = executeInstall({ target, skills, outDir, dryRun: true });
    expect(result.written.length).toBeGreaterThan(0);
    for (const w of result.written) {
      expect(existsSync(w.absPath)).toBe(false);
    }
  });

  it('written gemini styleguide includes every skill name', () => {
    const target = getTarget('gemini')!;
    const outDir = join(tmpRoot, 'gemini-content');
    executeInstall({ target, skills, outDir });
    const content = readFileSync(join(outDir, 'styleguide.md'), 'utf8');
    for (const s of skills) expect(content).toContain(`## ${s.name}`);
  });

  it('written aider CONVENTIONS.md includes every skill name', () => {
    const target = getTarget('aider')!;
    const outDir = join(tmpRoot, 'aider-content');
    executeInstall({ target, skills, outDir });
    const content = readFileSync(join(outDir, 'CONVENTIONS.md'), 'utf8');
    for (const s of skills) expect(content).toContain(`## ${s.name}`);
  });
});
