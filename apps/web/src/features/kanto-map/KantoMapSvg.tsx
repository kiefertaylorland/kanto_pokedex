import * as React from 'react';
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

type LabelAnchor = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const LABEL_ANCHORS: Record<
  LabelAnchor,
  { x: number; y: number; textAnchor: 'start' | 'middle' | 'end' }
> = {
  top: { x: 0, y: -4.6, textAnchor: 'middle' },
  right: { x: 3.4, y: 0, textAnchor: 'start' },
  bottom: { x: 0, y: 4.6, textAnchor: 'middle' },
  left: { x: -3.4, y: 0, textAnchor: 'end' },
  'top-left': { x: -3.2, y: -3.8, textAnchor: 'end' },
  'top-right': { x: 3.2, y: -3.8, textAnchor: 'start' },
  'bottom-left': { x: -3.2, y: 3.8, textAnchor: 'end' },
  'bottom-right': { x: 3.2, y: 3.8, textAnchor: 'start' },
};

/** Maps database label anchors to SVG text placement, defaulting to top for null/unknown values. */
function labelProps(anchor: string | null) {
  return LABEL_ANCHORS[(anchor ?? 'top') as LabelAnchor] ?? LABEL_ANCHORS.top;
}

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
function MarkerShape({ markerType, scale = 1 }: { markerType: string; scale?: number }) {
  const shape = MARKER_SHAPE[markerType] ?? 'circle';
  const fill = MARKER_FILL[markerType] ?? '#5E6056';
  const s = scale;
  const common = { fill, stroke: '#fff', strokeWidth: 0.4, className: 'transition-transform' };
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

/** A standalone marker glyph (used in the list-view location cards). */
export function MarkerGlyph({ markerType, className }: { markerType: string; className?: string }) {
  return (
    <svg viewBox="-3 -3 6 6" className={className} aria-hidden>
      <MarkerShape markerType={markerType} />
    </svg>
  );
}

/** Shape legend — explains the category encoding to every user. */
export function MapLegend({ markerTypes }: { markerTypes: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
      {markerTypes.map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <svg viewBox="-3 -3 6 6" className="h-3 w-3" aria-hidden>
            <MarkerShape markerType={t} />
          </svg>
          {SHAPE_LABEL[t] ?? t}
        </li>
      ))}
    </ul>
  );
}

/**
 * Retro-inspired Kanto map drawn entirely in code (no external asset — FR-027).
 * A fixed 0–100 viewBox inside a 1:1 framed container scales to any viewport
 * without pan/zoom (FR-033). Markers are real focusable buttons (SC-010); marker
 * shape encodes the location category so color is never the sole signal. Name
 * labels appear on hover/focus/selection. The non-spatial "View as list" path
 * is provided by the page's list view.
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
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div className="aspect-square overflow-hidden rounded-md border-2 border-border-strong">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Map of the Kanto region with clickable location markers"
        className="h-full w-full bg-surface-2"
      >
        {/* Stylized landmass / water backdrop */}
        <rect x="0" y="0" width="100" height="100" fill="#bfe3c0" />
        <rect x="0" y="62" width="100" height="38" fill="#9ec9e8" />
        <path data-testid="kanto-landmass" d="M6 8 H44 V40 H30 V58 H6 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />
        <path d="M52 6 H94 V46 H70 V60 H52 Z" fill="#a9d9a0" stroke="#7bb874" strokeWidth="0.5" />

        {locations.map(({ location, point, encounters }) => {
          const selected = selectedId === location.id;
          const isHovered = hovered === location.id;
          const showLabel = selected || isHovered;
          const scale = selected ? 1.35 : isHovered ? 1.12 : 1;
          const label = labelProps(point.label_anchor);
          return (
            <g key={location.id} transform={`translate(${point.x} ${point.y})`}>
              <a
                role="button"
                tabIndex={0}
                aria-label={`${location.display_name}, ${encounters.length} encounter${encounters.length === 1 ? '' : 's'}`}
                aria-pressed={selected}
                onClick={() => onSelect(location.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(location.id);
                  }
                }}
                onMouseEnter={() => setHovered(location.id)}
                onMouseLeave={() => setHovered((h) => (h === location.id ? null : h))}
                onFocus={() => setHovered(location.id)}
                onBlur={() => setHovered((h) => (h === location.id ? null : h))}
                className="cursor-pointer"
              >
                <MarkerShape markerType={point.marker_type} scale={scale} />
                {showLabel && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.textAnchor}
                    dominantBaseline="middle"
                    fontSize="2.2"
                    fontFamily="var(--font-display)"
                    fill="#1A1B17"
                    stroke="#F7F8F0"
                    strokeWidth="0.45"
                    paintOrder="stroke"
                    className="select-none"
                  >
                    {location.display_name}
                  </text>
                )}
              </a>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
