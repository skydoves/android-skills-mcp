import { z } from 'zod';

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SkillFrontmatterSchema = z
  .object({
    name: z.string().regex(NAME_RE, 'name must be lowercase kebab-case').max(64),
    description: z.string().min(1).max(1024),
    license: z.string().optional(),
    compatibility: z.string().max(500).optional(),
    'allowed-tools': z.string().optional(),
    metadata: z
      .object({
        author: z.string().optional(),
        version: z.string().optional(),
        keywords: z.array(z.string()).default([]),
      })
      .passthrough()
      .default({ keywords: [] }),
  })
  .passthrough()
  .transform((v) => {
    const { 'allowed-tools': allowedTools, metadata, ...rest } = v;
    return {
      ...rest,
      allowedTools,
      metadata: { ...metadata, keywords: metadata?.keywords ?? [] },
    };
  });

export type SkillFrontmatterParsed = z.infer<typeof SkillFrontmatterSchema>;
