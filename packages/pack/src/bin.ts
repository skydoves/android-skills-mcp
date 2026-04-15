#!/usr/bin/env node
import { cac } from 'cac';
import { executeInstall } from './install.js';
import { loadSkillsForPack } from './skills-source.js';
import { TARGETS, getTarget, listTargetIds } from './targets/index.js';

const VERSION = '0.1.0';
const cli = cac('android-skills-pack');

cli
  .command('list', 'List available skills and targets')
  .option('--skills-dir <path>', 'Use a custom skills directory')
  .option('--bundle <path>', 'Use a specific skills.json bundle')
  .action(async (opts: { skillsDir?: string; bundle?: string }) => {
    const skills = await loadSkillsForPack({ skillsDir: opts.skillsDir, bundlePath: opts.bundle });
    console.log(`Skills (${skills.length}):`);
    for (const s of skills) {
      console.log(`  - ${s.name} [${s.category}]  ${s.description.split('\n')[0]?.slice(0, 80)}`);
    }
    console.log(`\nTargets (${TARGETS.length}):`);
    for (const t of TARGETS) {
      console.log(`  - ${t.id.padEnd(12)} ${t.description}`);
    }
  });

cli
  .command('install', 'Install skills as native rules for the chosen target(s)')
  .option(
    '--target <id>',
    `Target tool: comma-separated list or "all". One of: ${listTargetIds().join(', ')}`,
  )
  .option('--skill <names>', 'Filter to specific skills (comma-separated)')
  .option('--out <path>', 'Output directory (overrides target default)')
  .option('--dry-run', 'Print what would be written without writing')
  .option('--force', 'Overwrite existing files')
  .option('--skills-dir <path>', 'Use a custom skills directory')
  .option('--bundle <path>', 'Use a specific skills.json bundle')
  .option('--cwd <path>', 'Working directory for default --out resolution', {
    default: process.cwd(),
  })
  .action(async (opts: InstallCliOpts) => {
    if (!opts.target) {
      console.error('Error: --target is required. Try --target cursor, or --target all.');
      console.error(`Available: ${listTargetIds().join(', ')}, all`);
      process.exit(2);
    }
    const targetIds =
      opts.target === 'all' ? listTargetIds() : opts.target.split(',').map((s) => s.trim());
    const targets = targetIds.map((id) => {
      const t = getTarget(id);
      if (!t) {
        console.error(`Unknown target: ${id}. Available: ${listTargetIds().join(', ')}`);
        process.exit(2);
      }
      return t;
    });

    const allSkills = await loadSkillsForPack({
      skillsDir: opts.skillsDir,
      bundlePath: opts.bundle,
    });
    const filterNames = opts.skill
      ? opts.skill
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    const skills = filterNames ? allSkills.filter((s) => filterNames.includes(s.name)) : allSkills;

    if (skills.length === 0) {
      console.error(`No skills matched filter: ${filterNames?.join(', ') ?? '(none)'}`);
      process.exit(1);
    }

    let totalWritten = 0;
    let totalSkipped = 0;
    for (const target of targets) {
      const outDir = opts.out ?? target.defaultOutDir(opts.cwd ?? process.cwd());
      const result = executeInstall({
        target,
        skills,
        outDir,
        dryRun: opts.dryRun,
        force: opts.force,
      });
      const verb = opts.dryRun ? '[dry-run] would write' : 'wrote';
      console.log(`\n[${target.id}] ${verb} ${result.written.length} file(s) → ${result.outDir}`);
      for (const w of result.written) {
        console.log(`  ${opts.dryRun ? '?' : '+'} ${w.absPath} (${w.bytes}B)`);
      }
      if (result.skipped.length > 0) {
        console.log(`  ${result.skipped.length} skipped (use --force to overwrite):`);
        for (const s of result.skipped) console.log(`  - ${s.absPath}: ${s.reason}`);
      }
      totalWritten += result.written.length;
      totalSkipped += result.skipped.length;
    }
    const action = opts.dryRun ? 'would be written' : 'written';
    console.log(`\nDone. ${totalWritten} ${action}, ${totalSkipped} skipped.`);
  });

cli.help();
cli.version(VERSION);

interface InstallCliOpts {
  target?: string;
  skill?: string;
  out?: string;
  dryRun?: boolean;
  force?: boolean;
  skillsDir?: string;
  bundle?: string;
  cwd?: string;
}

cli.parse();
