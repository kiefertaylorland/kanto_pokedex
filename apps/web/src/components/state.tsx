import { Loader2, AlertTriangle, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Reusable loading / error / empty states (FR-015, FR-034). */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-600 dark:text-zinc-400">
      <AlertTriangle className="h-8 w-8 text-pokedex-red" aria-hidden />
      <p className="max-w-sm text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-zinc-500">
      <SearchX className="h-8 w-8" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}
