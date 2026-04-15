import type { Skill } from '@android-skills/core';
import { flattenWithReferences, frontmatter } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function render(skill: Skill): string {
  const head = frontmatter({ applyTo: '**' });
  return `${head}\n\n# ${skill.name}\n\n${flattenWithReferences(skill)}\n`;
}

export const copilotTarget: Target = {
  id: 'copilot',
  description:
    'GitHub Copilot path-scoped instructions (.github/instructions/<name>.instructions.md)',
  defaultOutDir: (cwd) => `${cwd}/.github/instructions`,
  render(skills): RenderedFile[] {
    return skills.map((skill) => ({
      relPath: `${skill.name}.instructions.md`,
      contents: render(skill),
    }));
  },
};
