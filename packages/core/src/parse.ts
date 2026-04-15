import { readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import matter from 'gray-matter';
import { SkillFrontmatterSchema } from './schema.js';
import type { Skill, SkillFrontmatter, SkillReferenceRef } from './types.js';

const HEADING_RE = /^#{1,6}\s+(.+?)\s*$/gm;
const REF_LINK_RE = /\]\((\.\/)?(references\/[^)\s#]+)/g;

export interface ParseSkillOptions {
  /** absolute path to the skills root (used to derive `category`) */
  skillsRoot: string;
}

export function parseSkillFile(skillMdPath: string, opts: ParseSkillOptions): Skill {
  const absPath = resolve(skillMdPath);
  const raw = readFileSync(absPath, 'utf8');
  const { data, content } = matter(raw);

  const parsed = SkillFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid SKILL.md frontmatter at ${absPath}: ${parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  }

  const frontmatter: SkillFrontmatter = parsed.data as SkillFrontmatter;
  const dir = dirname(absPath);
  const skillsRoot = resolve(opts.skillsRoot);
  const rel = relative(skillsRoot, absPath);
  // category = first path segment under skills root
  const category = rel.split(/[\\/]/)[0] ?? basename(dir);

  const headings = Array.from(content.matchAll(HEADING_RE), (m) => (m[1] ?? '').trim()).filter(
    Boolean,
  );

  const refSet = new Set<string>();
  for (const m of content.matchAll(REF_LINK_RE)) {
    const refPath = m[2];
    if (refPath) refSet.add(refPath);
  }
  const references: SkillReferenceRef[] = Array.from(refSet)
    .sort()
    .map((relPath) => ({ relPath, absPath: resolve(dir, relPath) }));

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    category,
    path: absPath,
    dir,
    body: content,
    headings,
    keywords: frontmatter.metadata.keywords ?? [],
    frontmatter,
    references,
  };
}
