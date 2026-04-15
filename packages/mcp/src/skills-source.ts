import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Skill, loadSkills } from '@android-skills/core';

export interface LoadOpts {
  /** Override: parse fresh from a directory containing SKILL.md files. */
  skillsDir?: string;
  /** Override: read from a pre-built JSON snapshot. */
  bundlePath?: string;
}

export async function loadSkillsForServer(opts: LoadOpts = {}): Promise<Skill[]> {
  if (opts.skillsDir) {
    return loadSkills(opts.skillsDir);
  }
  const bundlePath = opts.bundlePath ?? fileURLToPath(new URL('./skills.json', import.meta.url));
  if (!existsSync(bundlePath)) {
    throw new Error(
      `No skills bundle found at ${bundlePath}. Pass --skills-dir <path> or rebuild the package.`,
    );
  }
  const raw = readFileSync(bundlePath, 'utf8');
  const skills = JSON.parse(raw) as Skill[];
  // Bundle stores paths relative to the original skills root; rebase to bundle dir
  // so absolute paths in error messages remain meaningful.
  const bundleDir = resolve(bundlePath, '..');
  return skills.map((s) => ({
    ...s,
    path: resolve(bundleDir, s.path),
    dir: resolve(bundleDir, s.dir),
    references: s.references.map((r) => ({
      ...r,
      absPath: resolve(bundleDir, r.absPath),
    })),
  }));
}
