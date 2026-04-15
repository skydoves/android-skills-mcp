import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', bin: 'src/bin.ts' },
  format: ['esm'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  sourcemap: true,
  target: 'node20',
  shims: false,
  // Inline @android-skills/core (workspace-only) plus its tiny runtime deps
  // so the published package is fully self-contained.
  noExternal: ['@android-skills/core'],
});
