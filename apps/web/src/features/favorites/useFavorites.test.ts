import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

describe('useFavorites store', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reads, dedupes, sorts, toggles, and exposes helpers', async () => {
    localStorage.setItem('kanto:favorites', JSON.stringify([25, 1, 25]));
    const mod = await import('./useFavorites');
    const { result } = renderHook(() => mod.useFavorites());

    expect(result.current.favorites).toEqual([1, 25]);
    expect(result.current.count).toBe(2);
    expect(result.current.isFavorite(25)).toBe(true);

    act(() => mod.toggleFavorite(4));
    await waitFor(() => expect(result.current.favorites).toEqual([1, 4, 25]));

    act(() => result.current.toggle(25));
    await waitFor(() => expect(result.current.favorites).toEqual([1, 4]));
  });

  it('falls back to an empty list on invalid storage and tolerates write failures', async () => {
    localStorage.setItem('kanto:favorites', '{oops');
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const mod = await import('./useFavorites');
    const { result } = renderHook(() => mod.useFavorites());

    expect(result.current.favorites).toEqual([]);

    act(() => mod.toggleFavorite(7));
    await waitFor(() => expect(result.current.favorites).toEqual([7]));
    expect(setItem).toHaveBeenCalled();
  });

  it('responds to storage updates, including localStorage.clear events', async () => {
    const mod = await import('./useFavorites');
    const { result, unmount } = renderHook(() => mod.useFavorites());

    act(() => {
      localStorage.setItem('kanto:favorites', JSON.stringify([133]));
      window.dispatchEvent(new StorageEvent('storage', { key: 'kanto:favorites' }));
    });
    await waitFor(() => expect(result.current.favorites).toEqual([133]));

    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    await waitFor(() => expect(result.current.favorites).toEqual([]));

    unmount();
  });

  it('provides the server snapshot during SSR', async () => {
    const mod = await import('./useFavorites');
    const App = () => {
      const { count } = mod.useFavorites();
      return createElement('span', null, count);
    };

    expect(renderToString(createElement(App))).toContain('0');
  });
});
