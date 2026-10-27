import Image from 'next/image';
import { IMAGE_QUALITY } from '@/utils/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Swords } from 'lucide-react';
import { FactsLine } from '@/components/content';
import { isIndexCategory } from '@/core/search/catalog';
import type { WikiFrontmatter } from '@/core/types/wiki';
import { getThreatLevel, type ThreatTone } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiArticleActions } from './WikiArticleActions';
import { ProximamenteChip } from '../mdx/Proximamente';

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
  status?: 'proximamente';
  /** Slug del artículo si tiene stats: habilita el CTA hacia la Arena. */
  arenaSlug?: string;
  /** Portada del frontmatter. Sin portada (o con la imagen de marca) no hay imagen. */
  image?: string;
  imagePosition?: string;
  /** Pie de foto canónico de la portada (frontmatter `imageCaption`). */
  imageCaption?: string;
  /** Entradilla (frontmatter `description`). */
  description?: string;
  stats?: WikiFrontmatter['stats'];
  /** El artículo tiene datos de ficha (`hasStats(frontmatter)` en la página); sin ellos no hay línea de datos. */
  hasStats: boolean;
  /** La portada ya aparece en el cuerpo del MDX: la cabecera no la repite. */
  imageInBody?: boolean;
}

/** Longitud · Amenaza · Peso, en ese orden y sin los que falten. */
function buildFacts(stats: NonNullable<WikiFrontmatter['stats']>) {
  const facts: { label: string; value: string; tone?: ThreatTone }[] = [];
  if (stats.length !== undefined) {
    facts.push({ label: 'Longitud', value: `${stats.length.toLocaleString('es-ES')} m` });
  }
  const threat = getThreatLevel(stats.hostility);
  if (threat) facts.push({ label: 'Amenaza', value: threat.label, tone: threat.tone });
  if (stats.weight) facts.push({ label: 'Peso', value: stats.weight });
  return facts;
}

export function WikiArticleHeader({
  title,
  universe,
  category,
  status,
  arenaSlug,
  image,
  imagePosition,
  imageCaption,
  description,
  stats,
  hasStats,
  imageInBody = false,
}: WikiArticleHeaderProps) {
  // Las páginas índice (Directorio, Categoría) no llevan portada: su `image` es solo la miniatura del menú.
  const cover = !imageInBody && !isIndexCategory(category) ? coverOf(image) : undefined;
  const facts = hasStats && stats ? buildFacts(stats) : [];

  return (
    <header className="relative z-20 border-b border-white/10">
      <div className="wiki-container pb-8">
        {cover && (
          <figure className="mt-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 md:aspect-[21/9] md:max-h-[380px]">
              <Image
                quality={IMAGE_QUALITY}
                src={cover}
                alt={title}
                fill
                fetchPriority="high"
                loading="eager"
                sizes="(min-width: 1408px) 1088px, (min-width: 1024px) calc(100vw - 20rem), (min-width: 768px) calc(100vw - 19rem), calc(100vw - 2rem)"
                className="object-cover"
                style={{ objectPosition: imagePosition ?? '50% 30%' }}
              />
            </div>
            {imageCaption && (
              <figcaption className="mt-3 px-1 text-[12px] leading-snug text-white/60 md:text-[13px]">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <div className={cn('flex flex-col gap-4', cover ? 'mt-4' : 'pt-6 lg:pt-8')}>
          <WikiBreadcrumbs universe={universe} category={category} />

          <div className="flex flex-col items-start gap-3">
            <h1 className="page-title">{title}</h1>
            {status === 'proximamente' && <ProximamenteChip />}
          </div>

          <FactsLine items={facts} />

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {arenaSlug && (
              <Link
                href={`/wiki/arena?a=${arenaSlug}` as Route}
                aria-label={`Enfrentar a ${title} en la Arena`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[12px] font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2339] motion-reduce:transition-none"
              >
                <Swords className="h-4 w-4" aria-hidden="true" />
                Arena
              </Link>
            )}
            <WikiArticleActions title={title} />
          </div>

          {description && <p className="max-w-3xl text-lg leading-relaxed text-white/85">{description}</p>}
        </div>
      </div>
    </header>
  );
}
