import type { Skill } from '@android-skills/core';
import { flattenWithReferences } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function renderAll(skills: Skill[]): string {
  const parts: string[] = [
    '# Android conventions',
    '',
    'Add this file via `aider --read CONVENTIONS.md` or `.aider.conf.yml`:',
    '```yaml',
    'read: CONVENTIONS.md',
    '```',
    '',
  ];
  for (const skill of skills) {
    parts.push(`---\n\n## ${skill.name}\n\n_${skill.description.trim()}_\n`);
    parts.push(flattenWithReferences(skill));
    parts.push('');
  }
  return `${parts.join('\n')}\n`;
}

export const aiderTarget: Target = {
  id: 'aider',
  description: 'Aider conventions (CONVENTIONS.md, single concatenated file at repo root)',
  defaultOutDir: (cwd) => cwd,
  render(skills): RenderedFile[] {
    return [{ relPath: 'CONVENTIONS.md', contents: renderAll(skills) }];
  },
};
