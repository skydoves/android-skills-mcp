import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '../dist/bin.js');
const SKILLS_DIR = resolve(__dirname, '../../../skills');

function run(...args: string[]): string {
  return execFileSync('node', [BIN, ...args, '--skills-dir', SKILLS_DIR], {
    encoding: 'utf8',
  });
}

describe.skipIf(!existsSync(BIN))('bin (built)', () => {
  it('list shows all 6 skills and 7 targets', () => {
    const out = run('list');
    expect(out).toContain('Skills (6):');
    expect(out).toContain('Targets (7):');
    expect(out).toContain('agp-9-upgrade');
    expect(out).toContain('cursor');
  });

  it('install --target cursor writes 6 .mdc files', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pack-bin-'));
    try {
      run('install', '--target', 'cursor', '--cwd', tmp);
      const files = readdirSync(join(tmp, '.cursor', 'rules'));
      expect(files.filter((f) => f.endsWith('.mdc'))).toHaveLength(6);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('--dry-run prints "would be written" and writes nothing', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pack-dry-'));
    try {
      const out = run('install', '--target', 'cursor', '--cwd', tmp, '--dry-run');
      expect(out).toContain('would be written');
      expect(out).not.toContain('1 written, 0 skipped');
      expect(existsSync(join(tmp, '.cursor'))).toBe(false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('install --target copilot emits valid YAML frontmatter', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pack-copilot-'));
    try {
      run('install', '--target', 'copilot', '--cwd', tmp);
      const matter = (require('node:module').createRequire(import.meta.url) as NodeRequire)(
        'gray-matter',
      ) as typeof import('gray-matter');
      const { readFileSync } = require('node:fs') as typeof import('node:fs');
      const file = join(tmp, '.github', 'instructions', 'edge-to-edge.instructions.md');
      const parsed = matter(readFileSync(file, 'utf8'));
      expect(parsed.data.applyTo).toBe('**');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('install --skill filter narrows to named skills', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pack-filter-'));
    try {
      run('install', '--target', 'cursor', '--skill', 'edge-to-edge,r8-analyzer', '--cwd', tmp);
      const files = readdirSync(join(tmp, '.cursor', 'rules')).sort();
      expect(files).toEqual(['edge-to-edge.mdc', 'r8-analyzer.mdc']);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
