import { describe, expect, it } from 'vitest';
import { PAGE_SIZE } from '.';

describe('PAGE_SIZE', () => {
  it('shows two even rows of seven Pokémon on the browse page', () => {
    expect(PAGE_SIZE).toBe(14);
  });
});
