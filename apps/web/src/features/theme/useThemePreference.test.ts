import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { THEME_STORAGE_KEY, toggleTheme, useThemePreference } from './useThemePreference';

describe('useThemePreference', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light mode when nothing is stored', () => {
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggle() flips the value and persists it to localStorage', () => {
    const { result } = renderHook(() => useThemePreference());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('reads a stored dark preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('exposes a standalone toggleTheme() that the hook observes', () => {
    const { result } = renderHook(() => useThemePreference());
    act(() => toggleTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('updates when another tab clears localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.theme).toBe('dark');

    localStorage.clear();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('falls back to light mode when storage access throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.theme).toBe('light');
    getItem.mockRestore();
  });
});
