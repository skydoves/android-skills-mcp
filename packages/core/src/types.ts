export interface SkillMetadata {
  author?: string;
  version?: string;
  keywords: string[];
  [k: string]: unknown;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  allowedTools?: string;
  metadata: SkillMetadata;
}

export interface SkillReferenceRef {
  relPath: string;
  absPath: string;
  /** present when the skill is loaded from a pre-bundled snapshot */
  content?: string;
}

export interface SkillReferenceContent extends SkillReferenceRef {
  content: string;
}

export interface Skill {
  name: string;
  description: string;
  category: string;
  path: string;
  dir: string;
  body: string;
  headings: string[];
  keywords: string[];
  frontmatter: SkillFrontmatter;
  references: SkillReferenceRef[];
}
