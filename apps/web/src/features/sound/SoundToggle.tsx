import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundPreference } from './useSoundPreference';

/**
 * Global on/off control for Pokémon cry playback (ON by default). State is
 * conveyed by icon + `aria-pressed` + a label that flips — never color alone.
 * Sits in the app header; the preference persists via `useSoundPreference`.
 */
export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSoundPreference();
  const label = enabled ? 'Turn cry sound off' : 'Turn cry sound on';
  const Icon = enabled ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-sm border text-white transition-colors',
        enabled ? 'border-white/70 hover:bg-white/10' : 'border-white/30 text-white/60 hover:bg-white/10',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
