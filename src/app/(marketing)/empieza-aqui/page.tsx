import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { UNIVERSES } from '@/features/marketing/config/universes';
import { YOUTUBE_SUBSCRIBE_URL } from '@/features/marketing/config/social';
import { countByUniverse, expedientesLabel } from '@/features/marketing/lib/universe-counts';
import { GLOSSARY, GUIDE } from '@/features/marketing/sections/start/start-guide';
import { START_HERE } from '@/features/monsters/config/start-here';

const INTRO_DESCRIPTION =
  'Qué son los universos de BorisaoBlois, por dónde empezar a leer, dónde ver sus vídeos y cómo usar el archivo.';

export const metadata: Metadata = pageMetadata({
  title: 'Empieza aquí | Universos de BorisaoBlois',
  description: INTRO_DESCRIPTION,
  path: '/empieza-aqui',
});

/** `/videos` la construye otra página de la fase 2; con `typedRoutes`, un string sin tipar evita atar este enlace a ella. */
const VIDEOS_ROUTE: string = '/videos';

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#00122E] motion-reduce:transition-none';

const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm font-bold text-primary transition-colors hover:text-orange-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/**
 * Guía del recién llegado (spec UX fase 2 §1): qué es esto, los cuatro universos, los expedientes de entrada, los vídeos,
 * las herramientas del archivo y un glosario mínimo. Estática: todo sale del contenido del build.
 */
export default async function EmpiezaAquiPage() {
  const repo = getContentRepository();
  const [articles, starters] = await Promise.all([
    repo.getArticles(),
    Promise.all(START_HERE.map((slug) => repo.getArticle(slug))),
  ]);
  const countOf = countByUniverse(articles);
  const firstFiles = starters.filter((a) => a !== null);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-16 pt-32">
        <div className="mx-auto max-w-6xl space-y-14 px-6">
          <header className="max-w-3xl space-y-4">
            <h1 className="page-title text-white">Empieza aquí</h1>
            <p className="text-lg leading-relaxed text-white/80">
              BorisaoBlois cuenta en YouTube historias animadas que viven en sus propios universos, cada uno con sus
              criaturas, sus personajes y sus misterios. Esta wiki es su archivo oficial: cada expediente reúne lo que
              Boris ha contado de ellos.
            </p>
          </header>

          <Section id="universos" title="Los universos" contained={false}>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {UNIVERSES.map((u) => (
                <ContentCard
                  key={u.id}
                  href={u.universeKey ? `/wiki?universe=${encodeURIComponent(u.universeKey)}#catalogo` : undefined}
                  title={u.title}
                  meta={u.comingSoon || !u.universeKey ? u.era : `${u.era} · ${expedientesLabel(countOf(u.universeKey))}`}
                  description={u.description}
                  lines={3}
                  image={u.image}
                  imagePosition={u.imagePosition}
                  pending={u.comingSoon}
                  aspect="video"
                  headingLevel={3}
                  sizes="(min-width: 1152px) 552px, (min-width: 768px) 50vw, 100vw"
                />
              ))}
            </div>
          </Section>

          {firstFiles.length > 0 && (
            <Section
              id="primeros-expedientes"
              title="Empieza por estos expedientes"
              action={{ href: '/wiki', label: 'Ver todo' }}
              contained={false}
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {firstFiles.map(({ slug, frontmatter: fm }) => (
                  <li key={slug}>
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
                      sizes="(min-width: 1024px) 216px, (min-width: 640px) 33vw, 50vw"
                      className="[&_h3]:text-base"
                    />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="videos" title="Mira sus vídeos" contained={false}>
            <div className="crystal-surface flex flex-col gap-5 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <p className="max-w-2xl leading-relaxed text-white/80">
                Las historias se cuentan en el canal de YouTube de BorisaoBlois. Aquí tienes todos sus vídeos, agrupados
                por universo y en orden de publicación.
              </p>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link href={VIDEOS_ROUTE as Route} className={`${BUTTON} bg-primary text-[#00122E] hover:bg-orange-400`}>
                  Ver todos los vídeos
                </Link>
                <a
                  href={YOUTUBE_SUBSCRIBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BUTTON} border border-white/15 bg-[#061a2e]/90 text-white hover:border-primary/40 hover:text-primary`}
                >
                  Suscríbete
                  <span className="sr-only"> (se abre en YouTube)</span>
                </a>
              </div>
            </div>
          </Section>

          <Section id="como-usar" title="Cómo usar el archivo" contained={false}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GUIDE.map((item) => (
                <li key={item.href} className="crystal-surface flex flex-col gap-1 rounded-2xl p-5">
                  <Link href={item.href as Route} prefetch={item.prefetch} className={`${TEXT_LINK} self-start text-lg`}>
                    {item.title} <span aria-hidden="true">›</span>
                  </Link>
                  <p className="text-sm leading-relaxed text-white/70">{item.text}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="glosario" title="Glosario" contained={false}>
            <dl className="grid gap-4 md:grid-cols-3">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#061a2e] p-5">
                  <dt className="font-display text-xl font-black uppercase italic tracking-tight text-white">{g.term}</dt>
                  <dd className="text-sm leading-relaxed text-white/75">{g.definition}</dd>
                  {g.href && g.linkLabel && (
                    <dd className="mt-auto">
                      <Link href={g.href as Route} className={`${TEXT_LINK} text-sm`}>
                        {g.linkLabel} <span aria-hidden="true">›</span>
                      </Link>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
