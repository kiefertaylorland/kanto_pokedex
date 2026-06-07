import { Link } from '@tanstack/react-router';
import { type PokemonCard, TYPE_TINTS } from '@kanto/shared';
import { Card, CardContent } from '@/components/ui/card';
import { TypeBadge } from '@/components/TypeBadge';

/** A single browser grid card (FR-009). Links to the detail page. */
export function PokemonCardItem({ pokemon }: { pokemon: PokemonCard }) {
  const dex = String(pokemon.national_dex_number).padStart(3, '0');
  const primaryType = pokemon.types[0];
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link to="/pokemon/$dexId" params={{ dexId: String(pokemon.national_dex_number) }} className="block">
        <CardContent className="flex flex-col items-center gap-2 p-4">
          <span className="self-start font-mono text-xs text-ink-500">#{dex}</span>
          {/* Type-tinted artwork well (non-text accent). */}
          <div
            className="flex h-24 w-24 items-center justify-center rounded-md bg-surface-2"
            style={primaryType ? { backgroundColor: TYPE_TINTS[primaryType] } : undefined}
          >
            {pokemon.sprite_url ? (
              <img
                src={pokemon.sprite_url}
                alt={pokemon.display_name}
                width={80}
                height={80}
                loading="lazy"
                className="h-20 w-20 object-contain"
              />
            ) : (
              <span className="text-xs text-ink-500">No image</span>
            )}
          </div>
          <span className="text-sm font-semibold text-ink-900">{pokemon.display_name}</span>
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
