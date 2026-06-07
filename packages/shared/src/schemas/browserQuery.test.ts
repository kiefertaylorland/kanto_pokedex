import { describe, it, expect } from 'vitest';
import { browserQuerySchema, interpretSearch, SORT_KEYS } from './browserQuery';

describe('browserQuerySchema (SEC-007)', () => {
  it('applies safe defaults for an empty input', () => {
    const r = browserQuerySchema.parse({});
    expect(r).toEqual({ q: '', types: [], sort: 'number', dir: 'asc', page: 1 });
  });

  it('rejects a non-allow-listed sort key by falling back to default', () => {
    const r = browserQuerySchema.parse({ sort: 'base_experience' });
    expect(r.sort).toBe('number');
    expect(SORT_KEYS).not.toContain('base_experience');
  });

  it('drops unknown type names from a multi-select filter', () => {
    const r = browserQuerySchema.parse({ types: ['fire', 'evil', 'water'] });
    expect(r.types).toEqual([]); // whole array fails enum → caught to []
  });

  it('keeps a fully valid multi-type OR filter', () => {
    const r = browserQuerySchema.parse({ types: ['fire', 'water'] });
    expect(r.types).toEqual(['fire', 'water']);
  });

  it('clamps page to a positive integer', () => {
    expect(browserQuerySchema.parse({ page: '-3' }).page).toBe(1);
    expect(browserQuerySchema.parse({ page: 'abc' }).page).toBe(1);
    expect(browserQuerySchema.parse({ page: '4' }).page).toBe(4);
  });

  it('truncates an over-long search string by rejecting → default', () => {
    const long = 'x'.repeat(80);
    expect(browserQuerySchema.parse({ q: long }).q).toBe('');
  });
});

describe('interpretSearch', () => {
  it('treats all-digit input as exact dex number (FR-010)', () => {
    expect(interpretSearch('25')).toEqual({ kind: 'number', value: 25 });
  });
  it('treats text as a name substring', () => {
    expect(interpretSearch('Bulba')).toEqual({ kind: 'name', value: 'bulba' });
  });
  it('treats blank as empty', () => {
    expect(interpretSearch('   ')).toEqual({ kind: 'empty' });
  });
});
