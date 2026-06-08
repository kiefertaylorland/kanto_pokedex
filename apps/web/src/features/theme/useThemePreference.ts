import { useEffect, useSyncExternalStore } from 'react';

export type ThemePreference = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'kanto:theme';

const DEFAULT_THEME: ThemePreference = 'light';
const listeners = new Set<() => void>();
let cache: ThemePreference | null = null;

function isTheme(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark';
}

function applyTheme(theme: ThemePreference): void {
  document.documentElement.dataset.theme = theme;
}

function read(): ThemePreference {
  if (cache !== null) return cache;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    cache = isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    cache = DEFAULT_THEME;
  }
  return cache;
}

function write(next: ThemePreference): void {
  cache = next;
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore quota / unavailable storage */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY || e.key === null) {
      cache = null;
      applyTheme(read());
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
    if (listeners.size === 0) cache = null;
  };
}

export function toggleTheme(): void {
  write(read() === 'light' ? 'dark' : 'light');
}

export function useThemePreference() {
  const theme = useSyncExternalStore(subscribe, read, () => DEFAULT_THEME);
  useEffect(() => applyTheme(theme), [theme]);
  return { theme, toggle: toggleTheme };
}
