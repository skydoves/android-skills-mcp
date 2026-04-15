import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Skill } from '@android-skills/core';
import type { RenderedFile, Target } from './types.js';

export interface InstallOptions {
  target: Target;
  skills: Skill[];
  outDir: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface InstallResult {
  outDir: string;
  written: { absPath: string; bytes: number }[];
  skipped: { absPath: string; reason: string }[];
}

export function planInstall(opts: InstallOptions): {
  outDir: string;
  files: (RenderedFile & { absPath: string })[];
} {
  const outDir = resolve(opts.outDir);
  const files = opts.target.render(opts.skills, { cwd: outDir }).map((f) => ({
    ...f,
    absPath: resolve(outDir, f.relPath),
  }));
  return { outDir, files };
}

export function executeInstall(opts: InstallOptions): InstallResult {
  const { outDir, files } = planInstall(opts);
  const written: InstallResult['written'] = [];
  const skipped: InstallResult['skipped'] = [];

  for (const file of files) {
    if (opts.dryRun) {
      written.push({ absPath: file.absPath, bytes: Buffer.byteLength(file.contents) });
      continue;
    }
    if (existsSync(file.absPath) && !opts.force) {
      skipped.push({ absPath: file.absPath, reason: 'exists (use --force to overwrite)' });
      continue;
    }
    mkdirSync(dirname(file.absPath), { recursive: true });
    writeFileSync(file.absPath, file.contents);
    written.push({ absPath: file.absPath, bytes: Buffer.byteLength(file.contents) });
  }

  return { outDir, written, skipped };
}
