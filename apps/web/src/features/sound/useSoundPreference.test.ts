import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundPreference, isSoundEnabled, toggleSound, SOUND_STORAGE_KEY } from './useSoundPreference';

describe('useSoundPreference', () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-level cache must be reset between tests; the storage event does that.
    window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
  });
  afterEach(() => {
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
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
    window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
    const { result } = renderHook(() => useSoundPreference());
    expect(result.current.enabled).toBe(false);
  });

  it('exposes a standalone toggleSound() that the hook observes', () => {
    const { result } = renderHook(() => useSoundPreference());
    act(() => toggleSound());
    expect(result.current.enabled).toBe(false);
  });
});
