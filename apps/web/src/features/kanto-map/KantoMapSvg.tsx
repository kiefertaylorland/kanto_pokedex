import { type MapLocationEncounters } from '@kanto/shared';

/** Marker fills drawn from the design-system palette (non-text accents). */
const MARKER_FILL: Record<string, string> = {
  city: '#C2370F', // brand red
  route: '#2E7D32', // grass green
  cave: '#9A6A1E', // ground
  forest: '#5A7A1E', // bug/forest
  water: '#1C5FBF', // water blue
  special: '#7B3F99', // poison purple
};

/** Category → marker shape (shape, not color, is the primary signal — WCAG 1.4.1). */
const MARKER_SHAPE: Record<string, string> = {
  city: 'square',
  route: 'circle',
  cave: 'diamond',
  forest: 'triangle',
  water: 'chip',
  special: 'star',
};

const SHAPE_LABEL: Record<string, string> = {
  city: 'City — square',
  route: 'Route — circle',
  cave: 'Cave — diamond',
  forest: 'Forest — triangle',
  water: 'Water — chip',
  special: 'Special — star',
};

/** Five-point star polygon points, centered on the origin and scaled by `s`. */
function starPoints(s: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 2.3 * s : 0.95 * s;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Renders the category shape for a marker, centered on the (already-translated) origin. */
function MarkerShape({ markerType, selected }: { markerType: string; selected: boolean }) {
  const shape = MARKER_SHAPE[markerType] ?? 'circle';
  const fill = MARKER_FILL[markerType] ?? '#5E6056';
  const s = selected ? 1.35 : 1;
  const common = { fill, stroke: '#fff', strokeWidth: 0.4, className: 'transition-all' };
  switch (shape) {
    case 'square':
      return <rect x={-1.8 * s} y={-1.8 * s} width={3.6 * s} height={3.6 * s} {...common} />;
    case 'diamond':
      return <rect x={-1.7 * s} y={-1.7 * s} width={3.4 * s} height={3.4 * s} transform="rotate(45)" {...common} />;
    case 'triangle':
      return <polygon points={`0,${-2.2 * s} ${2 * s},${1.6 * s} ${-2 * s},${1.6 * s}`} {...common} />;
    case 'chip':
      return <rect x={-2.4 * s} y={-1.5 * s} width={4.8 * s} height={3 * s} rx={1.4 * s} ry={1.4 * s} {...common} />;
    case 'star':
      return <polygon points={starPoints(s)} {...common} />;
    case 'circle':
    default:
      return <circle r={1.9 * s} {...common} />;
  }
}

/**
 * Retro-inspired Kanto map drawn entirely in code (no external asset — FR-027).
 * Uses a fixed 0–100 viewBox with `preserveAspectRatio` so it scales to fit any
 * viewport (desktop + mobile) without pan/zoom (FR-033). Markers are real
 * focusable buttons for keyboard accessibility (SC-010); marker shape encodes the
 * location category so color is never the sole signal. A "View as list" fallback
 * exposes every location to AT/keyboard users who can't use the visual map.
 */
export function KantoMapSvg({
  locations,
  selectedId,
  onSelect,
}: {
  locations: MapLocationEncounters[];
  selectedId: string | null;
  onSelect: (locationId: string) => void;
}) {
  const usedTypes = Array.from(new Set(locations.map((l) => l.point.marker_type)));

  return (
    <div className="space-y-2">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Map of the Kanto region with clickable location markers"
        className="h-auto w-full rounded-md border-2 border-border-strong bg-surface-2"
      >
        {/* Stylized landmass / water backdrop */}
        <rect x="0" y="0" width="100" height="100" fill="#bfe3c0" />
        <rect x="0" y="62" width="100" height="38" fill="#9ec9e8" />
        <path d="M6 8 H44 V40 H30 V58 H6 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />
        <path d="M52 6 H94 V46 H70 V60 H52 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />

        {locations.map(({ location, point, encounters }) => {
          const selected = selectedId === location.id;
          return (
            <g key={location.id} transform={`translate(${point.x} ${point.y})`}>
              <a
                role="button"
                tabIndex={0}
                aria-label={`${location.display_name}, ${encounters.length} encounter${encounters.length === 1 ? '' : 's'}`}
                onClick={() => onSelect(location.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(location.id);
                  }
                }}
                className="cursor-pointer"
              >
                <MarkerShape markerType={point.marker_type} selected={selected} />
                <text x="0" y="-3" textAnchor="middle" fontSize="2.6" fill="#1A1B17" className="select-none">
                  {location.display_name}
                </text>
              </a>
            </g>
          );
        })}
      </svg>

      {/* Shape legend — explains the category encoding to every user. */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
        {usedTypes.map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <svg viewBox="-3 -3 6 6" className="h-3 w-3" aria-hidden>
              <MarkerShape markerType={t} selected={false} />
            </svg>
            {SHAPE_LABEL[t] ?? t}
          </li>
        ))}
      </ul>

      {/* Accessibility fallback: every location as a plain list of buttons. */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-ink-700">View as list</summary>
        <ul className="mt-2 space-y-1">
          {locations.map(({ location, encounters }) => (
            <li key={location.id}>
              <button
                type="button"
                onClick={() => onSelect(location.id)}
                className="w-full rounded-sm px-2 py-1 text-left text-ink-700 hover:bg-surface-2"
              >
                {location.display_name}{' '}
                <span className="text-ink-500">
                  ({encounters.length} encounter{encounters.length === 1 ? '' : 's'})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
