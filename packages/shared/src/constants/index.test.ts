import { describe, expect, it } from 'vitest';
import { CONFIDENCE_DISPLAY, MAX_DEX, MIN_DEX, PAGE_SIZE, typeDisplayName } from './index';

describe('PAGE_SIZE', () => {
  it('shows two even rows of seven Pokémon on the browse page', () => {
    expect(PAGE_SIZE).toBe(14);
  });
});

describe('shared constants', () => {
  it('exports the Generation I dex bounds', () => {
    expect(MIN_DEX).toBe(1);
    expect(MAX_DEX).toBe(151);
  });

  it('formats type names for display', () => {
    expect(typeDisplayName('electric')).toBe('Electric');
  });

  it('keeps human-readable confidence labels', () => {
    expect(CONFIDENCE_DISPLAY.inferred).toBe('Inferred');
  });
});
