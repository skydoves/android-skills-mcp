import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Skill, loadSkills } from '@android-skills/core';

export interface LoadOpts {
  skillsDir?: string;
  bundlePath?: string;
}

export async function loadSkillsForPack(opts: LoadOpts = {}): Promise<Skill[]> {
  if (opts.skillsDir) return loadSkills(opts.skillsDir);
  const bundlePath = opts.bundlePath ?? fileURLToPath(new URL('./skills.json', import.meta.url));
  if (!existsSync(bundlePath)) {
    throw new Error(
      `No skills bundle found at ${bundlePath}. Pass --skills-dir <path> or rebuild.`,
    );
  }
  const skills = JSON.parse(readFileSync(bundlePath, 'utf8')) as Skill[];
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
