import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundPreference, isSoundEnabled, toggleSound, SOUND_STORAGE_KEY } from './useSoundPreference';

describe('useSoundPreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to ON when nothing is stored', () => {
    const { result } = renderHook(() => useSoundPreference());
    expect(result.current.enabled).toBe(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('toggle() flips the value and persists it to localStorage', () => {
    const { result } = renderHook(() => useSoundPreference());
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem(SOUND_STORAGE_KEY)).toBe('false');

    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem(SOUND_STORAGE_KEY)).toBe('true');
  });

  it('reads a stored "false" as disabled', () => {
    localStorage.setItem(SOUND_STORAGE_KEY, 'false');
    const { result } = renderHook(() => useSoundPreference());
    expect(result.current.enabled).toBe(false);
  });

  it('exposes a standalone toggleSound() that the hook observes', () => {
    const { result } = renderHook(() => useSoundPreference());
    act(() => toggleSound());
    expect(result.current.enabled).toBe(false);
  });

  it('updates when another tab clears localStorage', () => {
    localStorage.setItem(SOUND_STORAGE_KEY, 'false');
    const { result } = renderHook(() => useSoundPreference());
    expect(result.current.enabled).toBe(false);

    localStorage.clear();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(result.current.enabled).toBe(true);
  });
});
