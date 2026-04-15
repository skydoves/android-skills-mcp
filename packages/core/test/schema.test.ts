import { describe, expect, it } from 'vitest';
import { SkillFrontmatterSchema } from '../src/schema.js';

describe('SkillFrontmatterSchema', () => {
  it('accepts the canonical android/skills shape', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'edge-to-edge',
      description: 'Migrate to edge-to-edge.',
      license: 'Complete terms in LICENSE.txt',
      metadata: {
        author: 'Google LLC',
        keywords: ['android', 'compose'],
      },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.metadata.keywords).toEqual(['android', 'compose']);
    }
  });

  it('renames allowed-tools → allowedTools', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'foo',
      description: 'x',
      'allowed-tools': 'Read Edit',
      metadata: { keywords: [] },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.allowedTools).toBe('Read Edit');
  });

  it('rejects invalid name', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'Bad_Name',
      description: 'x',
    });
    expect(r.success).toBe(false);
  });

  it('rejects empty description', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'ok-name',
      description: '',
    });
    expect(r.success).toBe(false);
  });

  it('rejects description over 1024 chars', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'ok-name',
      description: 'a'.repeat(1025),
    });
    expect(r.success).toBe(false);
  });

  it('defaults metadata.keywords to []', () => {
    const r = SkillFrontmatterSchema.safeParse({
      name: 'ok-name',
      description: 'x',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.metadata.keywords).toEqual([]);
  });
});
