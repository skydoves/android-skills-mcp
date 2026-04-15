import type { Skill } from '@android-skills/core';
import { flattenWithReferences } from '../render.js';
import type { RenderedFile, Target } from '../types.js';

function renderAll(skills: Skill[]): string {
  const parts: string[] = [
    '# Android skill style guide',
    '',
    'This document is generated from android/skills. When reviewing or generating Android code, follow the matching skill below.',
    '',
  ];
  for (const skill of skills) {
    parts.push(`---\n\n## ${skill.name}\n\n_${skill.description.trim()}_\n`);
    parts.push(flattenWithReferences(skill));
    parts.push('');
  }
  return `${parts.join('\n')}\n`;
}

export const geminiTarget: Target = {
  id: 'gemini',
  description: 'Gemini Code Assist style guide (.gemini/styleguide.md, single concatenated file)',
  defaultOutDir: (cwd) => `${cwd}/.gemini`,
  render(skills): RenderedFile[] {
    return [{ relPath: 'styleguide.md', contents: renderAll(skills) }];
  },
};
