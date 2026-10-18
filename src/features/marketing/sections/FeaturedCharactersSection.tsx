import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { FEATURED_CHARACTERS } from '../config/featured-characters';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { getArticleBySlug } from '@/utils/mdx';

export async function FeaturedCharactersSection() {
  const entries = await Promise.all(
    FEATURED_CHARACTERS.map(async (def) => ({ def, article: await getArticleBySlug(def.slug) })),
  );

  return (
    <section id="personajes" className="relative scroll-mt-24 overflow-hidden py-24">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 eyebrow text-primary">
            <FolderOpen className="h-3.5 w-3.5" />
            Expedientes abiertos
          </div>
          <h2 className="section-title md:text-4xl lg:text-5xl">
            Personajes <span className="text-primary">destacados</span>
          </h2>
          <p className="text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Tres expedientes para empezar a leer el archivo.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {entries.map(({ def, article }) => {
            const fm = article?.frontmatter;
            const figure = fm?.stats?.length ? `${fm.stats.length} m` : 'DELIRIUM';
            return (
              <article
                key={def.slug}
                className="group crystal-surface flex flex-col overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {fm?.image && !isBrandPlaceholder(fm.image) ? (
                    <Image
                      src={fm.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      style={{ objectPosition: fm.imagePosition ?? '50% 50%' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <CategoryPlaceholder category={fm?.category} />
                  )}
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="eyebrow text-primary">
                    {fm?.category ?? 'Expediente'} · {figure}
                  </span>
                  <h3 className="mt-2 text-3xl font-bold uppercase italic tracking-tight text-white">{def.name}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/80">{def.description}</p>
                  <Link
                    href={`/wiki/${def.slug}`}
                    className="group/link mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Abrir expediente
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
