import type { Skill } from '@android-skills/core';

// Re-emit a SKILL.md from the parsed Skill object. Manual YAML to avoid an extra dep.
export function rebuildSkillMarkdown(
  skill: Skill,
  opts: { includeReferences?: boolean } = {},
): string {
  const fm = skill.frontmatter;
  const lines: string[] = [];
  lines.push('---');
  lines.push(`name: ${fm.name}`);
  // description may contain newlines — emit as a folded scalar
  if (fm.description.includes('\n') || fm.description.length > 80) {
    lines.push('description: |-');
    for (const dl of fm.description.split('\n')) lines.push(`  ${dl}`);
  } else {
    lines.push(`description: ${fm.description}`);
  }
  if (fm.license) lines.push(`license: ${fm.license}`);
  if (fm.compatibility) lines.push(`compatibility: ${fm.compatibility}`);
  if (fm.allowedTools) lines.push(`allowed-tools: ${fm.allowedTools}`);
  if (fm.metadata && Object.keys(fm.metadata).length > 0) {
    lines.push('metadata:');
    if (fm.metadata.author) lines.push(`  author: ${fm.metadata.author}`);
    if (fm.metadata.version) lines.push(`  version: ${fm.metadata.version}`);
    if (fm.metadata.keywords && fm.metadata.keywords.length > 0) {
      lines.push('  keywords:');
      for (const kw of fm.metadata.keywords) lines.push(`    - ${kw}`);
    }
  }
  lines.push('---');
  lines.push('');
  lines.push(skill.body.trimEnd());

  if (opts.includeReferences && skill.references.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('# Inlined references');
    for (const ref of skill.references) {
      lines.push('');
      lines.push(`## ${ref.relPath}`);
      lines.push('');
      lines.push((ref.content ?? '').trimEnd());
    }
  }
  return `${lines.join('\n')}\n`;
}
