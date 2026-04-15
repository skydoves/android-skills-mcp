import type { Skill } from '@android-skills/core';

export interface RenderedFile {
  /** Path relative to the target's output directory. */
  relPath: string;
  contents: string;
}

export interface RenderCtx {
  // Reserved for future use (e.g. per-target globs from frontmatter).
  cwd?: string;
}

export interface Target {
  id: string;
  description: string;
  defaultOutDir(cwd: string): string;
  render(skills: Skill[], ctx?: RenderCtx): RenderedFile[];
}
