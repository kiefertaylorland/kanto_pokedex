import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small speaker button overlaid on the detail artwork that replays the
 * Pokémon's cry. Disabled (and visually muted) when global sound is off, so the
 * on/off toggle stays the single source of truth.
 */
export function CryButton({
  onPlay,
  enabled,
  name,
  className,
}: {
  onPlay: () => void;
  enabled: boolean;
  /** Pokémon name, woven into the accessible label. */
  name: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      aria-label={`Play ${name}'s cry`}
      title={enabled ? `Play ${name}'s cry` : 'Sound is off'}
      onClick={onPlay}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-sm border-2 border-border-strong bg-surface text-ink-700 transition-colors',
        'hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-ink-400 disabled:opacity-60',
        className,
      )}
    >
      <Volume2 className="h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
