import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCry } from './useCry';
import { CRY_VOLUME } from './cry';

/** Captures every constructed fake Audio so assertions can inspect it. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  static last(): FakeAudio {
    const a = FakeAudio.instances.at(-1);
    if (!a) throw new Error('no Audio constructed');
    return a;
  }
  src: string;
  volume = 1;
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
  constructor(src?: string) {
    this.src = src ?? '';
    FakeAudio.instances.push(this);
  }
}

beforeEach(() => {
  FakeAudio.instances = [];
  vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useCry', () => {
  it('plays the url at the gentle default volume', () => {
    const { result } = renderHook(() => useCry());
    act(() => result.current.play('https://cdn/25.ogg'));

    expect(FakeAudio.instances).toHaveLength(1);
    const audio = FakeAudio.last();
    expect(audio.src).toBe('https://cdn/25.ogg');
    expect(audio.volume).toBe(CRY_VOLUME);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('reuses a single Audio element and restarts playback on replay', () => {
    const { result } = renderHook(() => useCry());
    act(() => result.current.play('https://cdn/1.ogg'));
    act(() => result.current.play('https://cdn/2.ogg'));

    expect(FakeAudio.instances).toHaveLength(1);
    const audio = FakeAudio.last();
    expect(audio.src).toBe('https://cdn/2.ogg');
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the url is null', () => {
    const { result } = renderHook(() => useCry());
    act(() => result.current.play(null));
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it('swallows a rejected play() (autoplay/codec blocked)', async () => {
    vi.stubGlobal(
      'Audio',
      class extends FakeAudio {
        play = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
      } as unknown as typeof Audio,
    );
    const { result } = renderHook(() => useCry());
    await expect(
      act(async () => {
        result.current.play('https://cdn/25.ogg');
      }),
    ).resolves.toBeUndefined();
  });
});
