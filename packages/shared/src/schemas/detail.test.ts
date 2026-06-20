import { describe, expect, it } from 'vitest';
import { parseDexId } from './detail';

describe('parseDexId', () => {
  it('parses a valid Generation I dex number', () => {
    expect(parseDexId('25')).toBe(25);
  });

  it('returns null for out-of-range or invalid values', () => {
    expect(parseDexId('0')).toBeNull();
    expect(parseDexId('152')).toBeNull();
    expect(parseDexId('pikachu')).toBeNull();
  });
});
