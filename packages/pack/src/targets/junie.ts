import { join } from 'node:path';
import type { Skill } from '@android-skills/core';
import { frontmatter } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function renderSkillMd(skill: Skill): string {
  const fm = skill.frontmatter;
  const head = frontmatter({
    name: fm.name,
    description: fm.description,
    license: fm.license,
  });
  return `${head}\n\n${skill.body.trimEnd()}\n`;
}

export const junieTarget: Target = {
  id: 'junie',
  description: 'JetBrains Junie agent skills (.junie/skills/<name>/SKILL.md)',
  defaultOutDir: (cwd) => join(cwd, '.junie', 'skills'),
  render(skills): RenderedFile[] {
    const out: RenderedFile[] = [];
    for (const skill of skills) {
      out.push({
        relPath: join(skill.name, 'SKILL.md'),
        contents: renderSkillMd(skill),
      });
      for (const ref of skill.references) {
        out.push({
          relPath: join(skill.name, ref.relPath),
          contents: `${(ref.content ?? '').trimEnd()}\n`,
        });
      }
    }
    return out;
  },
};
