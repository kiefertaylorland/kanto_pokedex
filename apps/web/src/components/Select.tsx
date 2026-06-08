import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Tokenized labeled select built on a native `<select>` (keyboard + screen-reader
 * friendly), styled to the design system. `onChange` receives the new value.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  className,
  id,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}) {
  const reactId = React.useId();
  const selectId = id ?? reactId;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={selectId} className="text-xs font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-sm border border-border-strong bg-surface px-3 pr-9 text-sm text-ink-900"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
          aria-hidden
        />
      </div>
    </div>
  );
}
