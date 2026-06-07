import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'muted';
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium',
        tone === 'default' ? 'bg-ink-900 text-surface' : 'bg-surface-3 text-ink-700',
        className,
      )}
      {...props}
    />
  );
}
