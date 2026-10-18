import type { Route } from 'next';
import { CrystalTile } from '@/components/crystal';
import { cn } from '@/utils/cn';
import { ProximamenteChip } from './mdx/Proximamente';

export interface CategoryTileData {
  title: string;
  slug: string;
  /** Valor exacto de `category` en el frontmatter. */
  category: string;
  count: number;
  image?: string;
  imagePosition?: string;
  /** Solo canon o factual (regla "solo canon"). */
  description?: string;
  /** Categoría sin lore canónico todavía. */
  comingSoon?: boolean;
}

/** Categoría de la wiki en el mosaico de la portada. */
export function CategoryTile({ tile, className, compact }: { tile: CategoryTileData; className?: string; compact?: boolean }) {
  return (
    <CrystalTile
      variant="media"
      href={`/wiki/${tile.slug}` as Route}
      image={tile.image}
      imagePosition={tile.imagePosition}
      category={tile.category}
      sizes="(min-width: 1024px) 25vw, 50vw"
      eyebrow={tile.count > 0 ? `${tile.count} registro${tile.count === 1 ? '' : 's'}` : 'Sin registros'}
      title={tile.title}
      titleSize="compact"
      titleClassName="break-words hyphens-auto"
      className={cn('min-h-[160px] sm:min-h-[200px]', compact && 'xl:min-h-[150px] xl:p-5', className)}
    >
      {tile.comingSoon ? (
        <ProximamenteChip className="self-start" />
      ) : tile.description ? (
        <p
          className={cn(
            'line-clamp-2 text-[13px] leading-snug text-white/70 sm:text-sm',
            compact && 'xl:line-clamp-3 xl:text-[12px]',
          )}
        >{tile.description}</p>
      ) : null}
    </CrystalTile>
  );
}
