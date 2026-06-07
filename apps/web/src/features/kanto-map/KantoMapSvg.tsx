import { type MapLocationEncounters } from '@kanto/shared';

const MARKER_FILL: Record<string, string> = {
  city: '#e11d48',
  route: '#16a34a',
  cave: '#8b5a2b',
  forest: '#15803d',
  water: '#0284c7',
  special: '#7c3aed',
};

type LabelOffset = { x: number; y: number; anchor: 'start' | 'middle' | 'end' };

const DEFAULT_LABEL_OFFSET: LabelOffset = { x: 0, y: -3.4, anchor: 'middle' };

const LABEL_OFFSETS: Record<string, LabelOffset> = {
  'pallet-town': { x: -3.6, y: -4.1, anchor: 'end' },
  'route-1': { x: -3.8, y: 1.1, anchor: 'end' },
  'viridian-city': { x: -3.8, y: 4.5, anchor: 'end' },
  'viridian-forest': { x: 3.6, y: -3.6, anchor: 'start' },
  'pewter-city': { x: 3.6, y: 1.1, anchor: 'start' },
  'mt-moon': { x: 0, y: -4.2, anchor: 'middle' },
  'cerulean-city': { x: 0, y: -4.2, anchor: 'middle' },
  'power-plant': { x: 3.6, y: 1.2, anchor: 'start' },
  'saffron-city': { x: 3.8, y: -3.7, anchor: 'start' },
  'vermilion-city': { x: 3.8, y: 4.6, anchor: 'start' },
  'lavender-town': { x: 3.8, y: -3.6, anchor: 'start' },
  'celadon-city': { x: -3.8, y: -3.7, anchor: 'end' },
  'fuchsia-city': { x: 3.8, y: -3.8, anchor: 'start' },
  'seafoam-islands': { x: 3.8, y: 3.9, anchor: 'start' },
  'cinnabar-island': { x: -3.8, y: 3.9, anchor: 'end' },
  'victory-road': { x: 3.6, y: 3.8, anchor: 'start' },
  'indigo-plateau': { x: 3.6, y: -3.8, anchor: 'start' },
};

const WESTERN_LANDMASS_PATH = 'M10 13 H44 V42 H31 V58 H10 Z';
const EASTERN_LANDMASS_PATH = 'M53 11 H94 V48 H72 V59 H53 Z';
const SOUTHERN_LANDMASS_PATH = 'M10 59 H72 V72 H61 V83 H49 V92 H29 V84 H10 Z';
const LANDMASS_PATH = [WESTERN_LANDMASS_PATH, EASTERN_LANDMASS_PATH, SOUTHERN_LANDMASS_PATH].join(' ');

const WESTERN_LAND_HIGHLIGHT_PATH = 'M13 17 H41 V39 H28 V55 H13 Z';
const EASTERN_LAND_HIGHLIGHT_PATH = 'M56 15 H91 V45 H69 V56 H56 Z';
const SOUTHERN_LAND_HIGHLIGHT_PATH = 'M13 62 H69 V69 H58 V80 H47 V89 H31 V81 H13 Z';
const LAND_HIGHLIGHT_PATH = [
  WESTERN_LAND_HIGHLIGHT_PATH,
  EASTERN_LAND_HIGHLIGHT_PATH,
  SOUTHERN_LAND_HIGHLIGHT_PATH,
].join(' ');

const WESTERN_ROUTE_SPINE = 'M20 90 V54 H32 L46 48 V76';
const CELADON_POWER_PLANT_ROUTE = 'M34 62 H62 V52';
const SAFFRON_LAVENDER_ROUTE = 'M46 62 H62';
const SOUTHERN_ISLAND_FERRY_ROUTE = 'M44 90 L36 95 L20 96';
const VICTORY_ROAD_INDIGO_ROUTE = 'M8 52 L6 46';

const ROUTE_PATHS = [
  WESTERN_ROUTE_SPINE,
  CELADON_POWER_PLANT_ROUTE,
  SAFFRON_LAVENDER_ROUTE,
  SOUTHERN_ISLAND_FERRY_ROUTE,
  VICTORY_ROAD_INDIGO_ROUTE,
];

const ROUTE_BASE_COLOR = '#f8e7a1';
const ROUTE_DASH_COLOR = '#caa85a';
const MARKER_RADIUS_DEFAULT = 1.8;
const MARKER_RADIUS_SELECTED = 2.4;
const LABEL_FONT_SIZE = 2.15;

const TERRAIN_DECORATIONS = [
  { path: 'M14 64 h12 v6 h-12z M16 72 h8 v5 h-8z', fill: '#75c878' }, // Viridian Forest canopy blocks
  { path: 'M30 47 l2 -4 l2 4z M31 47 h6 l2 -4 l2 4 h4 v5 h-14z', fill: '#a48a70' }, // Mt. Moon ridge and cave entrance
  { path: 'M54 50 h8 v5 h-8z M58 46 h5 v4 h-5z', fill: '#d9c68f' }, // Power Plant structure
];

const NORTHEAST_ISLANDS = [
  { cx: 91, cy: 17, r: 1.3 },
  { cx: 87, cy: 21, r: 1.1 },
  { cx: 92, cy: 25, r: 1.2 },
];

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
      <defs>
        <pattern id="kanto-water" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#8fd3f4" />
          <path d="M0 5 Q2 3.8 4 5 T8 5" fill="none" stroke="#5bb7e4" strokeWidth="0.35" opacity="0.45" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#kanto-water)" />
      <path
        d={LANDMASS_PATH}
        fill="#b8e4a8"
        stroke="#5fa85d"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d={LAND_HIGHLIGHT_PATH}
        fill="#d9f4c2"
        opacity="0.45"
      />
      <g aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ROUTE_PATHS.map((path) => (
          <g key={path}>
            <path d={path} stroke={ROUTE_BASE_COLOR} strokeWidth="3.6" />
            <path d={path} stroke={ROUTE_DASH_COLOR} strokeWidth="0.55" strokeDasharray="1.2 1.2" />
          </g>
        ))}
      </g>
      <g aria-hidden="true" opacity="0.85">
        {TERRAIN_DECORATIONS.map(({ path, fill }) => (
          <path key={path} d={path} fill={fill} />
        ))}
        {NORTHEAST_ISLANDS.map((island) => (
          <circle key={`${island.cx}-${island.cy}`} cx={island.cx} cy={island.cy} r={island.r} fill="#65b96d" />
        ))}
      </g>

      {locations.map(({ location, point, encounters }) => {
        const selected = selectedId === location.id;
        const fill = MARKER_FILL[point.marker_type] ?? '#555';
        const label = LABEL_OFFSETS[location.slug] ?? DEFAULT_LABEL_OFFSET;
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
              {selected && <circle r="3.8" fill={fill} opacity="0.25" />}
              <circle
                r={selected ? MARKER_RADIUS_SELECTED : MARKER_RADIUS_DEFAULT}
                fill={fill}
                stroke="#fff"
                strokeWidth="0.6"
                className="transition-all"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize={LABEL_FONT_SIZE}
                fontWeight="700"
                fill="#182018"
                stroke="#f8fff1"
                strokeWidth="0.55"
                paintOrder="stroke"
                className="select-none"
              >
                {location.display_name}
              </text>
            </a>
          </g>
        );
      })}
    </svg>
  );
}
