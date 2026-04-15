#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const VERSION = '0.1.0';

const { values } = parseArgs({
  options: {
    'skills-dir': { type: 'string' },
    bundle: { type: 'string' },
    version: { type: 'boolean', short: 'v' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: false,
});

if (values.version) {
  console.log(VERSION);
  process.exit(0);
}

if (values.help) {
  console.log(`android-skills-mcp ${VERSION}

MCP server exposing the android/skills library.

Usage: android-skills-mcp [options]

Options:
  --skills-dir <path>   Re-parse skills from a directory of SKILL.md files
                        instead of using the bundled snapshot.
  --bundle <path>       Use a specific pre-built skills.json snapshot.
  --version, -v         Print version and exit.
  --help, -h            Show this help.

The server speaks MCP over stdio. Add to Claude Code with:
  claude mcp add android-skills -- npx -y android-skills-mcp
`);
  process.exit(0);
}

const server = await createServer({
  skillsDir: values['skills-dir'],
  bundlePath: values.bundle,
  version: VERSION,
});

const transport = new StdioServerTransport();
await server.connect(transport);
