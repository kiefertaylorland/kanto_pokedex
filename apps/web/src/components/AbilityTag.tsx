import { Badge } from '@/components/ui/badge';

/** A single ability rendered as a framed chip, with the hidden qualifier. */
export function AbilityTag({ name, isHidden }: { name: string; isHidden?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-border-strong bg-surface px-2 py-1 text-sm text-ink-900">
      {name}
      {isHidden && <Badge tone="muted">Hidden</Badge>}
    </span>
  );
}
