/**
 * IP-safe two-segment pokéball mark (original geometry, not trademarked art).
 * Used for the header wordmark, the 404 well, and Compare identity wells.
 * Decorative by default (aria-hidden); pass a `title` to give it an accessible name.
 */
export function PokeballMark({
  className,
  title,
  tone = 'default',
}: {
  className?: string;
  title?: string;
  /** 'default' for light surfaces; 'inverse' for brand/dark backgrounds (header). */
  tone?: 'default' | 'inverse';
}) {
  const inverse = tone === 'inverse';
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {/* Outer frame + bottom half. */}
      <circle
        cx="24"
        cy="24"
        r="22"
        className={inverse ? 'fill-transparent stroke-white' : 'fill-surface stroke-ink-900'}
        strokeWidth="2"
      />
      {/* Top half. */}
      <path d="M2 24a22 22 0 0 1 44 0Z" className={inverse ? 'fill-white' : 'fill-brand-600'} />
      {/* Equator band. */}
      <rect x="2" y="22" width="44" height="4" className={inverse ? 'fill-white' : 'fill-ink-900'} />
      {/* Center button. */}
      <circle
        cx="24"
        cy="24"
        r="7"
        className={inverse ? 'fill-brand-600 stroke-white' : 'fill-surface stroke-ink-900'}
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="3" className={inverse ? 'fill-white' : 'fill-ink-900'} />
    </svg>
  );
}
