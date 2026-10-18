import type { Route } from 'next';
import { CrystalTile } from '@/components/crystal';
import { ProximamenteChip } from '@/features/monsters/components/wiki/mdx/Proximamente';
import type { UniverseDef } from '../config/universes';

interface UniverseTileProps {
  universe: UniverseDef;
  /** Artículos de la wiki con `universe` = `universeKey`. */
  count: number;
  priority?: boolean;
  className?: string;
}

/** Universo en el mosaico de la landing; enlaza a la wiki filtrada por universo. */
export function UniverseTile({ universe, count, priority = false, className }: UniverseTileProps) {
  const href = universe.universeKey
    ? (`/wiki?universe=${encodeURIComponent(universe.universeKey)}#explorar` as Route)
    : undefined;
  return (
    <CrystalTile
      variant="media"
      href={href}
      image={universe.image}
      imagePosition={universe.imagePosition}
      priority={priority}
      sizes="(min-width: 1024px) 25vw, 50vw"
      eyebrow={universe.era}
      title={universe.title}
      titleSize="compact"
      titleClassName="break-words hyphens-auto"
      className={className}
    >
      {universe.comingSoon ? (
        <ProximamenteChip className="self-start" />
      ) : (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
          {count} {count === 1 ? 'artículo' : 'artículos'}
        </span>
      )}
    </CrystalTile>
  );
}
