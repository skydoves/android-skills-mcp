#!/usr/bin/env node
import { execSync } from 'node:child_process';
// Ensures ./skills exists by cloning android/skills, or pulling latest if already present.
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const skillsDir = resolve(repoRoot, 'skills');
const upstream = 'https://github.com/android/skills.git';

const run = (cmd, cwd = repoRoot) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
};

if (!existsSync(skillsDir)) {
  run(`git clone --depth=1 ${upstream} skills`);
} else {
  run('git pull --ff-only', skillsDir);
}
