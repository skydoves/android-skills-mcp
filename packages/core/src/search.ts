import MiniSearch, { type SearchResult } from 'minisearch';
import type { Skill } from './types.js';

export interface SkillSearchHit {
  name: string;
  score: number;
  description: string;
  category: string;
  keywords: string[];
  snippet: string;
}

export interface SkillIndex {
  search(query: string, k?: number): SkillSearchHit[];
  size: number;
}

export function buildIndex(skills: Skill[]): SkillIndex {
  const ms = new MiniSearch({
    fields: ['name', 'keywords', 'description', 'headings'],
    storeFields: ['name', 'description', 'category', 'keywords', 'snippet'],
    idField: 'name',
    searchOptions: {
      boost: { name: 5, keywords: 3, description: 2, headings: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  ms.addAll(
    skills.map((s) => ({
      name: s.name,
      description: s.description,
      keywords: s.keywords.join(' '),
      headings: s.headings.join(' '),
      category: s.category,
      snippet: makeSnippet(s),
    })),
  );

  return {
    size: skills.length,
    search(query, k = 5) {
      const results = ms.search(query) as (SearchResult & {
        description?: string;
        category?: string;
        keywords?: string;
        snippet?: string;
      })[];
      return results.slice(0, k).map((r) => ({
        name: String(r.id),
        score: r.score,
        description: r.description ?? '',
        category: r.category ?? '',
        keywords: typeof r.keywords === 'string' ? r.keywords.split(' ').filter(Boolean) : [],
        snippet: r.snippet ?? '',
      }));
    },
  };
}

function makeSnippet(skill: Skill): string {
  // first non-empty line of body, up to 200 chars
  for (const line of skill.body.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed.length > 200 ? `${trimmed.slice(0, 197)}...` : trimmed;
    }
  }
  return skill.description;
}
