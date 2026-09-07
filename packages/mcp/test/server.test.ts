import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Skill, loadSkills } from '@android-skills/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, '../../../skills');

async function makeClient() {
  const server = await createServer({ skillsDir: SKILLS_DIR });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { client };
}

function parseTextResult(result: { content: { type: string; text?: string }[] }): unknown {
  const first = result.content[0];
  if (!first || first.type !== 'text' || !first.text) throw new Error('no text content');
  return JSON.parse(first.text);
}

describe('android-skills-mcp server (in-memory)', () => {
  let client: Client;
  // The expected roster comes from the same upstream checkout the server reads,
  // so a sync that adds or drops skills upstream cannot fail this suite.
  let skills: Skill[];
  beforeAll(async () => {
    ({ client } = await makeClient());
    skills = await loadSkills(SKILLS_DIR);
  });

  it('list_skills returns every skill in the checkout', async () => {
    const result = await client.callTool({ name: 'list_skills', arguments: {} });
    const items = parseTextResult(result as never) as { name: string }[];
    expect(items.map((s) => s.name).sort()).toEqual(skills.map((s) => s.name).sort());
    expect(items.length).toBeGreaterThan(0);
  });

  it('list_skills filters by category', async () => {
    const [category] = [...new Set(skills.map((s) => s.category))].sort();
    const expected = skills
      .filter((s) => s.category === category)
      .map((s) => s.name)
      .sort();
    const result = await client.callTool({
      name: 'list_skills',
      arguments: { category },
    });
    const items = parseTextResult(result as never) as { name: string; category: string }[];
    expect(expected.length).toBeGreaterThan(0);
    expect(items.map((s) => s.name).sort()).toEqual(expected);
    for (const item of items) expect(item.category).toBe(category);
  });

  it('search_skills ranks "xml to compose" with the migration skill first', async () => {
    const result = await client.callTool({
      name: 'search_skills',
      arguments: { query: 'xml to compose' },
    });
    const hits = parseTextResult(result as never) as { name: string }[];
    expect(hits[0]?.name).toBe('migrate-xml-views-to-jetpack-compose');
  });

  it('search_skills supports k limit', async () => {
    const result = await client.callTool({
      name: 'search_skills',
      arguments: { query: 'android', k: 2 },
    });
    const hits = parseTextResult(result as never) as unknown[];
    expect(hits.length).toBeLessThanOrEqual(2);
  });

  it('get_skill returns rebuilt SKILL.md with frontmatter', async () => {
    const result = (await client.callTool({
      name: 'get_skill',
      arguments: { name: 'edge-to-edge' },
    })) as { content: { type: string; text: string }[] };
    const text = result.content[0]?.text ?? '';
    expect(text.startsWith('---\n')).toBe(true);
    expect(text).toContain('name: edge-to-edge');
    expect(text).toContain('## Step 1');
  });

  it('get_skill with include_references inlines reference files', async () => {
    const result = (await client.callTool({
      name: 'get_skill',
      arguments: { name: 'r8-analyzer', include_references: true },
    })) as { content: { type: string; text: string }[] };
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('# Inlined references');
    expect(text).toContain('## references/');
  });

  it('get_skill returns isError on unknown name', async () => {
    const result = (await client.callTool({
      name: 'get_skill',
      arguments: { name: 'does-not-exist' },
    })) as { isError?: boolean; content: { text?: string }[] };
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Unknown skill');
  });

  it('lists one resource per skill', async () => {
    const result = await client.listResources();
    expect(result.resources.length).toBe(skills.length);
    const uris = result.resources.map((r) => r.uri).sort();
    expect(uris).toContain('skill://edge-to-edge');
  });

  it('reads a skill resource by URI', async () => {
    const result = await client.readResource({ uri: 'skill://navigation-3' });
    expect(result.contents[0]?.mimeType).toBe('text/markdown');
    const text = (result.contents[0]?.text ?? '') as string;
    expect(text).toContain('name: navigation-3');
  });
});
