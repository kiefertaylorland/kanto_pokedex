import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Page not found</h1>
      <p className="text-ink-500">That page doesn’t exist in this Pokédex.</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
