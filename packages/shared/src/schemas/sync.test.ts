import { describe, it, expect } from 'vitest';
import { evaluateSyncResult } from './sync';

describe('evaluateSyncResult (SEC-014)', () => {
  it('passes only for exactly 151 contiguous dex numbers', () => {
    const ids = Array.from({ length: 151 }, (_, i) => i + 1);
    expect(evaluateSyncResult(ids)).toEqual({ ok: true, count: 151 });
  });

  it('fails when fewer than 151 are processed', () => {
    const ids = Array.from({ length: 150 }, (_, i) => i + 1);
    const r = evaluateSyncResult(ids);
    expect(r.ok).toBe(false);
  });

  it('fails on a gap even if count appears right after dedupe', () => {
    const ids = Array.from({ length: 151 }, (_, i) => i + 1);
    ids[150] = 1; // duplicate #1, missing #151 → 150 unique
    const r = evaluateSyncResult(ids);
    expect(r.ok).toBe(false);
  });
});
