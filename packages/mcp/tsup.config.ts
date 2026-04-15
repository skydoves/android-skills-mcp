import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', bin: 'src/bin.ts' },
  format: ['esm'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  sourcemap: true,
  target: 'node20',
  shims: false,
  // Inline the workspace-only @android-skills/core so the published package has
  // no runtime dep on it. Otherwise `npm install android-skills-mcp` would 404.
  noExternal: ['@android-skills/core'],
});
