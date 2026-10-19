import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';

/** "Criatura de la semana" en una sola fila (spec #55 §6): miniatura, nombre, "Categoría · Universo" y "Ver ficha ›". Toda la fila es el enlace. */
export function CommunityCreatureRow({ creature }: { creature: WikiArticleSummary }) {
  const { title, image, imagePosition, category, universe } = creature.frontmatter;
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;
  const meta = [category, universe].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/wiki/${creature.slug}` as Route}
      className="crystal-surface flex items-center gap-4 rounded-2xl p-3 transition-colors duration-200 hover:border-primary/40 focus-visible:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#00122E]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} className="[&_span]:hidden [&_svg]:h-7 [&_svg]:w-7" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-black uppercase italic leading-tight tracking-tight text-white">{title}</p>
        {meta && <p className="mt-0.5 truncate text-[12px] font-semibold text-white/55">{meta}</p>}
      </div>
      <span className="shrink-0 pr-2 text-[12px] font-bold uppercase tracking-wider text-primary">
        Ver ficha <span aria-hidden="true">›</span>
      </span>
    </Link>
  );
}
