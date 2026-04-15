import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseSkillFile } from './parse.js';
import type { Skill, SkillReferenceContent } from './types.js';

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.github', 'dist']);

function* walkSkillFiles(root: string): Generator<string> {
  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop();
    if (!dir) continue;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (IGNORED_DIRS.has(name)) continue;
      const full = join(dir, name);
      let st: ReturnType<typeof statSync>;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        stack.push(full);
      } else if (name === 'SKILL.md') {
        yield full;
      }
    }
  }
}

export async function loadSkills(skillsRoot: string): Promise<Skill[]> {
  const root = resolve(skillsRoot);
  if (!existsSync(root)) {
    throw new Error(`Skills root does not exist: ${root}`);
  }
  const skills: Skill[] = [];
  for (const path of walkSkillFiles(root)) {
    skills.push(parseSkillFile(path, { skillsRoot: root }));
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export function loadSkillReferences(skill: Skill): SkillReferenceContent[] {
  return skill.references.map((ref) => ({
    relPath: ref.relPath,
    absPath: ref.absPath,
    content: ref.content ?? (existsSync(ref.absPath) ? readFileSync(ref.absPath, 'utf8') : ''),
  }));
}
