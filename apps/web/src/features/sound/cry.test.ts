import { describe, it, expect } from 'vitest';
import { cryUrl, CRY_VOLUME } from './cry';

describe('cryUrl', () => {
  it('builds the PokeAPI latest-cries URL for a dex/Pokémon id', () => {
    expect(cryUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg',
    );
  });

  it('handles the dex boundaries (Bulbasaur and Mew)', () => {
    expect(cryUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg',
    );
    expect(cryUrl(151)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/151.ogg',
    );
  });

  it('returns null for non-positive or non-integer ids', () => {
    expect(cryUrl(0)).toBeNull();
    expect(cryUrl(-1)).toBeNull();
    expect(cryUrl(1.5)).toBeNull();
    expect(cryUrl(Number.NaN)).toBeNull();
  });
});

describe('CRY_VOLUME', () => {
  it('is a gentle 30% so it does not startle unaware/sensitive users', () => {
    expect(CRY_VOLUME).toBe(0.3);
  });
});
