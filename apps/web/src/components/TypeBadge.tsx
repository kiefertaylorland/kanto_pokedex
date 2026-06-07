import { type TypeName, typeDisplayName, TYPE_COLORS } from '@kanto/shared';

/** Colored type chip. Renders the type name as escaped text (SEC-009). */
export function TypeBadge({ type }: { type: TypeName }) {
  return (
    <span
      className="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {typeDisplayName(type)}
    </span>
  );
}
