#!/usr/bin/env node
// Verify the MCP server bin works with the official MCP TypeScript client SDK
// over a real stdio subprocess.

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BIN_PATH = resolve(__dirname, '../dist/bin.js');

const results = [];
function record(label, pass, detail = '') {
  results.push({ label, pass, detail });
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${label}${detail ? ' - ' + detail : ''}`);
}

let exitCode = 0;
const transport = new StdioClientTransport({
  command: 'node',
  args: [BIN_PATH],
});
const client = new Client({ name: 'verify-client', version: '0.0.1' }, { capabilities: {} });

try {
  await client.connect(transport);

  // a) listTools -> 3 tools
  const toolsResp = await client.listTools();
  const toolNames = toolsResp.tools.map((t) => t.name).sort();
  const expectedTools = ['get_skill', 'list_skills', 'search_skills'].sort();
  record(
    'a) listTools returns 3 tools (list_skills, search_skills, get_skill)',
    toolsResp.tools.length === 3 && JSON.stringify(toolNames) === JSON.stringify(expectedTools),
    `got [${toolNames.join(', ')}]`,
  );

  // b) list_skills -> 6 skills
  const listResp = await client.callTool({
    name: 'list_skills',
    arguments: {},
  });
  const listText = listResp.content?.[0]?.text ?? '';
  let listParsed;
  try {
    listParsed = JSON.parse(listText);
  } catch {
    listParsed = null;
  }
  const skillCount = Array.isArray(listParsed)
    ? listParsed.length
    : Array.isArray(listParsed?.skills)
      ? listParsed.skills.length
      : null;
  record('b) callTool list_skills returns 6 skills', skillCount === 6, `got ${skillCount}`);

  // c) search_skills -> top hit migrate-xml-views-to-jetpack-compose
  const searchResp = await client.callTool({
    name: 'search_skills',
    arguments: { query: 'compose migration' },
  });
  const searchText = searchResp.content?.[0]?.text ?? '';
  let searchParsed;
  try {
    searchParsed = JSON.parse(searchText);
  } catch {
    searchParsed = null;
  }
  const searchArr = Array.isArray(searchParsed)
    ? searchParsed
    : Array.isArray(searchParsed?.results)
      ? searchParsed.results
      : Array.isArray(searchParsed?.matches)
        ? searchParsed.matches
        : null;
  const top3 = (searchArr ?? []).slice(0, 3);
  console.log('Top 3 search results:', JSON.stringify(top3, null, 2));
  const topName = top3[0]?.name ?? top3[0]?.id ?? top3[0]?.skill ?? top3[0]?.slug;
  record(
    'c) search_skills top hit is migrate-xml-views-to-jetpack-compose',
    topName === 'migrate-xml-views-to-jetpack-compose',
    `top=${topName}`,
  );

  // d) get_skill edge-to-edge -> contains "## Step 1"
  const getResp = await client.callTool({
    name: 'get_skill',
    arguments: { name: 'edge-to-edge' },
  });
  const getText = getResp.content?.[0]?.text ?? '';
  record(
    'd) get_skill edge-to-edge text contains "## Step 1"',
    getText.includes('## Step 1'),
    `len=${getText.length}`,
  );

  // e) listResources -> 6
  const resourcesResp = await client.listResources();
  record(
    'e) listResources returns 6 resources',
    resourcesResp.resources.length === 6,
    `got ${resourcesResp.resources.length}`,
  );

  // f) readResource skill://r8-analyzer -> mimeType text/markdown
  const readResp = await client.readResource({ uri: 'skill://r8-analyzer' });
  const mt = readResp.contents?.[0]?.mimeType;
  record(
    'f) readResource skill://r8-analyzer mimeType is text/markdown',
    mt === 'text/markdown',
    `mimeType=${mt}`,
  );
} catch (err) {
  console.error('ERROR during verification:', err);
  exitCode = 1;
} finally {
  try {
    await client.close();
  } catch {}
  try {
    await transport.close?.();
  } catch {}
}

const failed = results.filter((r) => !r.pass);
if (failed.length > 0) exitCode = 1;
console.log(`\nSummary: ${results.length - failed.length}/${results.length} assertions passed`);
process.exit(exitCode);
