import { useSyncExternalStore } from 'react';

/**
 * The cry-sound on/off preference, persisted as a single boolean in
 * localStorage. A tiny external store keeps the header `SoundToggle`, the detail
 * page auto-play, and the replay button in sync within a tab; the `storage`
 * event syncs across tabs. Modeled on `features/favorites/useFavorites.ts`.
 *
 * Default is ON: an unset/garbage value reads as enabled, and only an explicit
 * stored `'false'` disables sound.
 */
export const SOUND_STORAGE_KEY = 'kanto:sound';

const listeners = new Set<() => void>();
let cache: boolean | null = null;

function read(): boolean {
  if (cache !== null) return cache;
  try {
    cache = localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
  } catch {
    cache = true;
  }
  return cache;
}

function write(next: boolean): void {
  cache = next;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(next));
  } catch {
    /* ignore quota / unavailable storage */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SOUND_STORAGE_KEY || e.key === null) {
      cache = null; // invalidate; next snapshot re-reads from storage
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
    if (listeners.size === 0) cache = null; // re-read fresh on next subscribe
  };
}

/** Read the current preference outside React (e.g. in a one-shot effect). */
export function isSoundEnabled(): boolean {
  return read();
}

export function toggleSound(): void {
  write(!read());
}

export function useSoundPreference() {
  const enabled = useSyncExternalStore(subscribe, read, () => true);
  return { enabled, toggle: toggleSound };
}
