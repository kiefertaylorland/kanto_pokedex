import { useSyncExternalStore } from 'react';

/**
 * Favorites are stored as a list of national dex numbers in localStorage. A tiny
 * external store keeps every `FavStar`, the header count, and the Favorites grid
 * in sync within a tab; the `storage` event syncs across tabs.
 *
 * Persistence is intentionally swappable: when auth is wired, replace read/write
 * with a user-scoped table — the hook surface (favorites / isFavorite / toggle /
 * count) stays the same.
 */
const STORAGE_KEY = 'kanto:favorites';
const EMPTY: readonly number[] = Object.freeze([]);

const listeners = new Set<() => void>();
let cache: number[] | null = null;

function read(): number[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? Array.from(new Set(parsed.filter((n): n is number => typeof n === 'number'))).sort((a, b) => a - b)
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: number[]): void {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / unavailable storage */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null; // invalidate; next snapshot re-reads from storage
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): number[] {
  return read();
}

function getServerSnapshot(): readonly number[] {
  return EMPTY;
}

export function toggleFavorite(dex: number): void {
  const current = read();
  const next = current.includes(dex)
    ? current.filter((d) => d !== dex)
    : [...current, dex].sort((a, b) => a - b);
  write(next);
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    favorites,
    count: favorites.length,
    isFavorite: (dex: number) => favorites.includes(dex),
    toggle: toggleFavorite,
  };
}
