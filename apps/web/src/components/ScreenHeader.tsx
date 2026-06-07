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
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        {kicker && <p className="text-xs uppercase tracking-wide text-ink-500">{kicker}</p>}
        <h1 className="font-display text-2xl text-ink-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
