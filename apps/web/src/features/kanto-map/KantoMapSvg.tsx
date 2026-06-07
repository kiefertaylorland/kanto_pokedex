import { type MapLocationEncounters } from '@kanto/shared';

const MARKER_FILL: Record<string, string> = {
  city: '#d7263d',
  route: '#3a7d44',
  cave: '#6b4f2a',
  forest: '#1f7a3f',
  water: '#2a6fb0',
  special: '#7b3fa0',
};

/**
 * Retro-inspired Kanto map drawn entirely in code (no external asset — FR-027).
 * Uses a fixed 0–100 viewBox with `preserveAspectRatio` so it scales to fit any
 * viewport (desktop + mobile) without pan/zoom (FR-033). Markers are real
 * focusable buttons for keyboard accessibility (SC-010).
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
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of the Kanto region with clickable location markers"
      className="h-auto w-full rounded-lg border border-zinc-300 bg-pokedex-screen/30 dark:border-zinc-700"
    >
      {/* Stylized landmass / water backdrop */}
      <rect x="0" y="0" width="100" height="100" fill="#bfe3c0" />
      <rect x="0" y="62" width="100" height="38" fill="#9ec9e8" />
      <path d="M6 8 H44 V40 H30 V58 H6 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />
      <path d="M52 6 H94 V46 H70 V60 H52 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />

      {locations.map(({ location, point, encounters }) => {
        const selected = selectedId === location.id;
        const fill = MARKER_FILL[point.marker_type] ?? '#555';
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
              className="cursor-pointer outline-none"
            >
              <circle
                r={selected ? 2.6 : 1.9}
                fill={fill}
                stroke="#fff"
                strokeWidth="0.4"
                className="transition-all"
              />
              <text x="0" y="-3" textAnchor="middle" fontSize="2.6" fill="#1b1b1f" className="select-none">
                {location.display_name}
              </text>
            </a>
          </g>
        );
      })}
    </svg>
  );
}
