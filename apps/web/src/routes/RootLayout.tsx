import { Link, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/auth';
import { Button } from '@/components/ui/button';
import { PokeballMark } from '@/components/PokeballMark';
import { SoundToggle } from '@/features/sound/SoundToggle';

/** App shell: header nav + routed outlet. Header adapts to auth state. */
export function RootLayout() {
  const { isAuthenticated, signOut } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-border-strong bg-brand-600 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-sm">
            <PokeballMark className="h-5 w-5" tone="inverse" />
            Kanto Pokédex
          </Link>
          <nav className="flex items-center gap-2">
            <SoundToggle />
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Link to="/pokedex">Browse</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Link to="/map">Map</Link>
                </Button>
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={() => void signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
