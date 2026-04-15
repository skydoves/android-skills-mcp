import type { Skill } from '@android-skills/core';

/** Emit a YAML frontmatter block for the given key/value pairs. */
export function frontmatter(obj: Record<string, unknown>): string {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${yamlScalar(String(item))}`);
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      lines.push(`${k}: ${v}`);
    } else if (typeof v === 'string' && (v.includes('\n') || v.length > 80)) {
      lines.push(`${k}: |-`);
      for (const line of v.split('\n')) lines.push(`  ${line}`);
    } else if (typeof v === 'string') {
      lines.push(`${k}: ${yamlScalar(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

/**
 * Emit a YAML plain scalar, double-quoting when the value would otherwise be
 * misparsed (alias `*foo`, anchor `&foo`, glob `**`, reserved keywords, leading
 * special chars, embedded `: `).
 */
function yamlScalar(s: string): string {
  if (s === '') return '""';
  if (/^[*&!@%>|`#?-]/.test(s)) return jsonQuote(s);
  if (s.includes('*')) return jsonQuote(s);
  if (s.includes(': ') || s.endsWith(':')) return jsonQuote(s);
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(s)) return jsonQuote(s);
  if (/^-?\d/.test(s)) return jsonQuote(s);
  return s;
}

function jsonQuote(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Body + flattened references appended as `## <relPath>` sections. */
export function flattenWithReferences(skill: Skill): string {
  let out = skill.body.trimEnd();
  if (skill.references.length > 0) {
    out += '\n\n---\n\n# Inlined references\n';
    for (const ref of skill.references) {
      out += `\n## ${ref.relPath}\n\n${(ref.content ?? '').trimEnd()}\n`;
    }
  }
  return out;
}

/** Single-line, no leading/trailing whitespace, collapsed internal whitespace. */
export function singleLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}
