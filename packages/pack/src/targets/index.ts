import type { Target } from '../types.js';
import { aiderTarget } from './aider.js';
import { claudeCodeTarget } from './claude-code.js';
import { continueTarget } from './continue.js';
import { copilotTarget } from './copilot.js';
import { cursorTarget } from './cursor.js';
import { geminiTarget } from './gemini.js';
import { junieTarget } from './junie.js';

export const TARGETS: readonly Target[] = [
  claudeCodeTarget,
  cursorTarget,
  copilotTarget,
  geminiTarget,
  junieTarget,
  continueTarget,
  aiderTarget,
];

const TARGETS_BY_ID = new Map<string, Target>(TARGETS.map((t) => [t.id, t]));

export function getTarget(id: string): Target | undefined {
  return TARGETS_BY_ID.get(id);
}

export function listTargetIds(): string[] {
  return TARGETS.map((t) => t.id);
}
