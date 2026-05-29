import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import matter from 'gray-matter';
import { SkillFrontmatterSchema } from './schema.js';
import type { Skill, SkillFrontmatter, SkillReferenceRef } from './types.js';

const HEADING_RE = /^#{1,6}\s+(.+?)\s*$/gm;
const REF_LINK_RE = /\]\((\.\/)?(references\/[^)\s#]+)/g;

export interface ParseSkillOptions {
  /** absolute path to the skills root (used to derive `category`) */
  skillsRoot: string;
}

function* walkRefFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      yield* walkRefFiles(full);
    } else {
      yield full;
    }
  }
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
  // A SKILL.md may link to a directory under `references/` (e.g. `references/schemas`)
  // as a folder of files. Expand any directory ref into its concrete file refs so
  // downstream consumers can always read each ref as a single file.
  const expanded = new Set<string>();
  for (const relPath of refSet) {
    const absPath = resolve(dir, relPath);
    if (existsSync(absPath) && statSync(absPath).isDirectory()) {
      for (const child of walkRefFiles(absPath)) {
        expanded.add(
          `${relPath.replace(/\/$/, '')}/${relative(absPath, child).replace(/\\/g, '/')}`,
        );
      }
    } else {
      expanded.add(relPath);
    }
  }
  const references: SkillReferenceRef[] = Array.from(expanded)
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
