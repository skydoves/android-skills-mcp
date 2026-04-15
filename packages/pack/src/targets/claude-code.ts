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
    'allowed-tools': fm.allowedTools,
  });
  return `${head}\n\n${skill.body.trimEnd()}\n`;
}

export const claudeCodeTarget: Target = {
  id: 'claude-code',
  description: 'Claude Code skills (.claude/skills/<name>/SKILL.md, near 1:1 copy with references)',
  defaultOutDir: (cwd) => join(cwd, '.claude', 'skills'),
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
