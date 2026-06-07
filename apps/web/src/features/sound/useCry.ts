import { useCallback, useRef } from 'react';
import { CRY_VOLUME } from './cry';

/**
 * Plays a Pokémon cry through a single lazily-created `HTMLAudioElement`,
 * pinned to the gentle {@link CRY_VOLUME}. Reusing one element keeps replays
 * from layering on top of each other. Playback is best-effort: a rejected
 * `play()` (autoplay policy, unsupported codec) is swallowed so the UI never
 * throws.
 */
export function useCry() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string | null) => {
    if (!url) return;
    const audio = audioRef.current ?? (audioRef.current = new Audio());
    audio.src = url;
    audio.volume = CRY_VOLUME;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* autoplay blocked or codec unsupported — silently ignore */
    });
  }, []);

  return { play };
}
