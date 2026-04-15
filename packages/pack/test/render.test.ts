import { describe, expect, it } from 'vitest';
import { flattenWithReferences, frontmatter, singleLine } from '../src/render.js';

describe('frontmatter', () => {
  it('emits a basic block', () => {
    const out = frontmatter({ name: 'foo', value: 1, flag: true });
    expect(out).toBe('---\nname: foo\nvalue: 1\nflag: true\n---');
  });

  it('skips undefined and null values', () => {
    const out = frontmatter({ a: 'x', b: undefined, c: null });
    expect(out).toBe('---\na: x\n---');
  });

  it('emits arrays as YAML lists, skips empty arrays', () => {
    const out = frontmatter({ tags: ['x', 'y'], empty: [] });
    expect(out).toBe('---\ntags:\n  - x\n  - y\n---');
  });

  it('uses folded scalar for multi-line strings', () => {
    const out = frontmatter({ desc: 'line1\nline2' });
    expect(out).toBe('---\ndesc: |-\n  line1\n  line2\n---');
  });

  it('uses folded scalar for strings over 80 chars', () => {
    const long = 'a'.repeat(100);
    expect(frontmatter({ desc: long })).toContain('desc: |-');
  });

  it('quotes "**" so YAML does not parse it as an alias', () => {
    expect(frontmatter({ applyTo: '**' })).toBe('---\napplyTo: "**"\n---');
  });

  it('quotes strings starting with YAML special chars', () => {
    expect(frontmatter({ k: '*foo' })).toBe('---\nk: "*foo"\n---');
    expect(frontmatter({ k: '&anchor' })).toBe('---\nk: "&anchor"\n---');
    expect(frontmatter({ k: '!tag' })).toBe('---\nk: "!tag"\n---');
    expect(frontmatter({ k: '@mention' })).toBe('---\nk: "@mention"\n---');
    expect(frontmatter({ k: '%directive' })).toBe('---\nk: "%directive"\n---');
    expect(frontmatter({ k: '#hash' })).toBe('---\nk: "#hash"\n---');
    expect(frontmatter({ k: '?question' })).toBe('---\nk: "?question"\n---');
    expect(frontmatter({ k: '-leading' })).toBe('---\nk: "-leading"\n---');
  });

  it('quotes reserved YAML keywords', () => {
    expect(frontmatter({ k: 'true' })).toBe('---\nk: "true"\n---');
    expect(frontmatter({ k: 'false' })).toBe('---\nk: "false"\n---');
    expect(frontmatter({ k: 'null' })).toBe('---\nk: "null"\n---');
    expect(frontmatter({ k: 'YES' })).toBe('---\nk: "YES"\n---');
  });

  it('quotes numeric-looking strings to keep them as strings', () => {
    expect(frontmatter({ k: '42' })).toBe('---\nk: "42"\n---');
    expect(frontmatter({ k: '-3.14' })).toBe('---\nk: "-3.14"\n---');
  });

  it('quotes strings with embedded ": "', () => {
    expect(frontmatter({ k: 'foo: bar' })).toBe('---\nk: "foo: bar"\n---');
  });

  it('quotes empty string', () => {
    expect(frontmatter({ k: '' })).toBe('---\nk: ""\n---');
  });

  it('escapes inner backslashes and quotes', () => {
    expect(frontmatter({ k: 'has "quotes" and \\ slash *' })).toBe(
      '---\nk: "has \\"quotes\\" and \\\\ slash *"\n---',
    );
  });

  it('quotes glob patterns with embedded *', () => {
    expect(frontmatter({ glob: 'src/**/*.ts' })).toBe('---\nglob: "src/**/*.ts"\n---');
  });

  it('also quotes scalar items inside arrays', () => {
    expect(frontmatter({ tags: ['*ok', 'true', 'plain'] })).toBe(
      '---\ntags:\n  - "*ok"\n  - "true"\n  - plain\n---',
    );
  });
});

describe('singleLine', () => {
  it('collapses internal whitespace', () => {
    expect(singleLine('foo   bar\nbaz')).toBe('foo bar baz');
  });

  it('trims edges', () => {
    expect(singleLine('  foo  ')).toBe('foo');
  });
});

describe('flattenWithReferences', () => {
  it('returns body unchanged when there are no references', () => {
    const skill = makeSkill({ body: 'hello\n', references: [] });
    expect(flattenWithReferences(skill)).toBe('hello');
  });

  it('appends each reference under a "## relPath" heading', () => {
    const skill = makeSkill({
      body: 'main',
      references: [
        { relPath: 'references/a.md', absPath: '/x/references/a.md', content: 'A' },
        { relPath: 'references/b.md', absPath: '/x/references/b.md', content: 'B' },
      ],
    });
    const out = flattenWithReferences(skill);
    expect(out).toContain('# Inlined references');
    expect(out).toContain('## references/a.md');
    expect(out).toContain('A');
    expect(out).toContain('## references/b.md');
    expect(out).toContain('B');
  });
});

function makeSkill(overrides: Partial<import('@android-skills/core').Skill>) {
  return {
    name: 't',
    description: '',
    category: '',
    path: '',
    dir: '',
    body: '',
    headings: [],
    keywords: [],
    frontmatter: {
      name: 't',
      description: '',
      metadata: { keywords: [] },
    },
    references: [],
    ...overrides,
  } as import('@android-skills/core').Skill;
}
