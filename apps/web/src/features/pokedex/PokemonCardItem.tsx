import { Link } from '@tanstack/react-router';
import { type PokemonCard } from '@kanto/shared';
import { Card, CardContent } from '@/components/ui/card';
import { TypeBadge } from '@/components/TypeBadge';

/** A single browser grid card (FR-009). Links to the detail page. */
export function PokemonCardItem({ pokemon }: { pokemon: PokemonCard }) {
  const dex = String(pokemon.national_dex_number).padStart(3, '0');
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link to="/pokemon/$dexId" params={{ dexId: String(pokemon.national_dex_number) }} className="block">
        <CardContent className="flex flex-col items-center gap-2 p-4">
          <span className="self-start text-xs font-mono text-zinc-400">#{dex}</span>
          {pokemon.sprite_url ? (
            <img
              src={pokemon.sprite_url}
              alt={pokemon.display_name}
              width={96}
              height={96}
              loading="lazy"
              className="h-24 w-24 object-contain"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
              No image
            </div>
          )}
          <span className="text-sm font-semibold">{pokemon.display_name}</span>
          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
