import * as React from 'react';

/**
 * Page header with a Silkscreen display title, an optional kicker (e.g. an
 * "N saved" count), and an optional actions slot on the right.
 */
export function ScreenHeader({
  title,
  kicker,
  actions,
}: {
  title: string;
  kicker?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && (
          <p className="mb-2 font-display text-2xs uppercase tracking-wide text-brand-600">{kicker}</p>
        )}
        <h1 className="font-sans text-3xl font-bold text-ink-900">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
