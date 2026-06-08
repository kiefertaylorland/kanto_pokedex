import { type TypeName, TYPE_TINTS, TYPE_COLORS } from '@kanto/shared';
import { cn } from '@/lib/utils';

/**
 * Type-tinted square artwork well. Shows the real sprite when available, else a
 * faint pokéball placeholder glyph (IP-safe, original geometry). A neutral well
 * (no `type`) is used by the 404 page.
 */
export function PokeWell({
  type,
  spriteUrl,
  alt,
  size = 200,
  className,
}: {
  type?: TypeName;
  spriteUrl?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}) {
  const tint = type ? TYPE_TINTS[type] : undefined;
  const hue = type ? TYPE_COLORS[type] : '#767A6C';
  const glyph = Math.round(size * 0.6);
  return (
    <div
      className={cn('flex items-center justify-center rounded-md', className)}
      style={{ width: size, height: size, backgroundColor: tint ?? 'rgb(var(--surface-2))' }}
    >
      {spriteUrl ? (
        <img
          src={spriteUrl}
          alt={alt ?? ''}
          width={glyph}
          height={glyph}
          loading="lazy"
          className="object-contain"
          style={{ width: glyph, height: glyph }}
        />
      ) : (
        <svg
          width={glyph}
          height={glyph}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          style={{ color: hue, opacity: 0.45 }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
          <path d="M2 12 H22" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3.1" fill={tint ?? 'currentColor'} stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )}
    </div>
  );
}
