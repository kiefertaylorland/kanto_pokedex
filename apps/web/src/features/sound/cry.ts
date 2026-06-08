/**
 * Pokémon cries are published on the same CDN host as the sprites
 * (raw.githubusercontent.com) at a deterministic, id-keyed path — so the URL is
 * derived on the client with no extra data to sync. For Kanto the PokéAPI id
 * equals the national dex number (1–151).
 */
const CRIES_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';

/** Gentle default volume (30%) so the cry never startles unaware listeners. */
export const CRY_VOLUME = 0.3;

/** Cry audio URL for a Pokémon id, or null when the id is not a positive integer. */
export function cryUrl(id: number): string | null {
  if (!Number.isInteger(id) || id <= 0) return null;
  return `${CRIES_BASE}/${id}.ogg`;
}
