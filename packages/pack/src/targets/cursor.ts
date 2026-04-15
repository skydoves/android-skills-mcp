import type { Skill } from '@android-skills/core';
import { flattenWithReferences, frontmatter, singleLine } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function render(skill: Skill): string {
  const head = frontmatter({
    description: singleLine(skill.description),
    alwaysApply: false,
  });
  return `${head}\n\n${flattenWithReferences(skill)}\n`;
}

export const cursorTarget: Target = {
  id: 'cursor',
  description: 'Cursor project rules (.cursor/rules/<name>.mdc)',
  defaultOutDir: (cwd) => `${cwd}/.cursor/rules`,
  render(skills): RenderedFile[] {
    return skills.map((skill) => ({
      relPath: `${skill.name}.mdc`,
      contents: render(skill),
    }));
  },
};
