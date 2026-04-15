import type { Skill } from '@android-skills/core';
import { flattenWithReferences, frontmatter, singleLine } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function render(skill: Skill): string {
  const head = frontmatter({
    name: skill.name,
    description: singleLine(skill.description),
    alwaysApply: false,
  });
  return `${head}\n\n${flattenWithReferences(skill)}\n`;
}

export const continueTarget: Target = {
  id: 'continue',
  description: 'Continue.dev workspace rules (.continue/rules/<name>.md)',
  defaultOutDir: (cwd) => `${cwd}/.continue/rules`,
  render(skills): RenderedFile[] {
    return skills.map((skill) => ({
      relPath: `${skill.name}.md`,
      contents: render(skill),
    }));
  },
};
