import { Suspense } from 'react';
import Link from 'next/link';
import { ContentCard } from '@/components/content/ContentCard';
import { getContentRepository } from '@/core/content';
import { START_HERE } from '@/features/monsters/config/start-here';
import { StartHereGate } from './StartHereGate';

/** Fila «Empieza por aquí» (spec 2026-10-29 §C): fichas estrella con portada, encima del explorador. */
export async function StartHere() {
  const repo = getContentRepository();
  const found = await Promise.all(START_HERE.map((slug) => repo.getArticle(slug)));
  const articles = found.filter((a) => a !== null);
  if (articles.length === 0) return null;

  const row = (
    <section aria-labelledby="start-here-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <h2 id="start-here-title" className="text-lg font-semibold text-white/80">
          ¿Nuevo en los universos de BorisaoBlois? Empieza por estos expedientes.
        </h2>
        {/* La guía completa del recién llegado (UX fase 2 §1). */}
        <Link
          href="/empieza-aqui"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        >
          Guía para empezar <span aria-hidden="true">›</span>
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0">
        {articles.map(({ slug, frontmatter: fm }) => (
          <li key={slug} className="w-40 shrink-0 snap-start sm:w-48 lg:w-auto">
            <ContentCard
              href={`/wiki/${slug}`}
              title={fm.title}
              meta={fm.category}
              image={fm.image}
              imagePosition={fm.imagePosition}
              category={fm.category}
              aspect="portrait"
              headingLevel={3}
              titleLines={2}
              sizes="(min-width: 1024px) 18vw, 192px"
              className="[&_h3]:text-base"
            />
          </li>
        ))}
      </ul>
    </section>
  );

  // useSearchParams exige Suspense; mientras tanto el HTML estático ya trae la fila.
  return (
    <Suspense fallback={row}>
      <StartHereGate>{row}</StartHereGate>
    </Suspense>
  );
}
