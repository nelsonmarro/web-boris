import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { getEntityIndex } from '@/core/content/entities';
import { registroSlugs } from '@/core/search/registro';
import { REGISTRO_ROUTE } from '@/core/search/wiki-routes';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { RegistroProgress } from '@/features/monsters/components/wiki/registro/RegistroProgress';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getChannelVideos, type ChannelVideo } from '@/features/community/data/channel-videos';
import { getNextPoll } from '@/features/community/lib/poll-schedule';
import { latestVideos } from '@/features/community/lib/latest-videos';
import { newsImage } from '@/features/community/lib/news-image';
import { CommunityCreatureRow } from '@/features/community/components/CommunityCreatureRow';
import { NewsFeatured } from '@/features/community/components/NewsFeatured';
import { NewsList } from '@/features/community/components/NewsList';
import { PollHistoryTiles } from '@/features/community/components/PollHistoryTiles';
import { PollTile, type PollFighter } from '@/features/community/components/PollTile';
import { cn } from '@/utils/cn';
import { formatFecha } from '@/utils/format-date';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';

/** Criatura, duelo, próximo duelo y vídeos cambian sin rebuild; la encuesta y el historial se piden aparte, sin caché. */
export const revalidate = 3600;

const INTRO = 'Lo último de BorisaoBlois, la votación de la semana y lo que más pide la comunidad.';

/** Vídeos de «Últimos vídeos» (spec 2026-10-27 §6). */
const MAX_VIDEOS = 4;

export const metadata: Metadata = pageMetadata({
  title: 'Comunidad | Universos de BorisaoBlois',
  description: INTRO,
  path: '/comunidad',
});

const videoDate = (published?: string) =>
  published && !Number.isNaN(Date.parse(published)) ? formatFecha(new Date(published)) : undefined;

function VideoCard({ video, sizes, className }: { video: ChannelVideo; sizes: string; className?: string }) {
  return (
    <ContentCard
      external
      href={youtubeWatchUrl(video.id)}
      title={video.title}
      meta={videoDate(video.published)}
      image={youtubeThumbUrl(video.id)}
      headingLevel={3}
      sizes={sizes}
      className={className}
    />
  );
}

export default async function ComunidadPage() {
  const repo = getContentRepository();
  const [articles, weekly, curated, news, channelVideos, entityIndex] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    repo.getCuratedPolls(),
    repo.getNews(5),
    getChannelVideos(),
    getEntityIndex(),
  ]);
  const { poll } = weekly;
  const nextPoll = getNextPoll(curated, weekly.fighters.map((a) => a.slug));
  // Todas las fichas, no solo las de la encuesta de este render: el lunes la API devuelve la encuesta nueva y la página ISR
  // aún es la vieja; con el mapa completo la encuesta nueva (y el historial) sale con título y retrato en lugar del slug.
  const fighterCards: Record<string, PollFighter> = Object.fromEntries(
    articles.map((a) => [
      a.slug,
      {
        slug: a.slug,
        title: a.frontmatter.title,
        image: a.frontmatter.image,
        imagePosition: a.frontmatter.imagePosition,
        category: a.frontmatter.category,
        status: a.frontmatter.status,
      },
    ]),
  );

  const articlesBySlug = new Map(articles.map((a) => [a.slug, a]));
  const [featuredNews, ...moreNews] = news;
  const creature = pickFeatured(articles);
  const videos = latestVideos(channelVideos, MAX_VIDEOS);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-16 pt-32">
        {/* Ordenada por importancia (spec 2026-10-27 §2). En escritorio la columna se ensancha y las novedades, la
            encuesta con la criatura, los vídeos y el historial se reparten en horizontal; en móvil todo sigue en una
            columna. El historial y el registro van bajo el pliegue: se pintan en el cliente y su aparición no mueve
            lo que se ve al entrar. */}
        <div className="mx-auto max-w-6xl space-y-14 px-6">
          <header className="space-y-4">
            <h1 className="page-title text-white">Comunidad</h1>
            <p className="text-lg leading-relaxed text-white/70">{INTRO}</p>
          </header>

          <Section id="novedades" title="Novedades" contained={false}>
            {featuredNews ? (
              // Desde md, dos columnas al 50 %: la destacada a la izquierda y las demás a la derecha.
              <div className={cn('grid gap-6', moreNews.length > 0 ? 'md:grid-cols-2 md:items-start md:gap-8' : 'md:max-w-2xl')}>
                <NewsFeatured entry={featuredNews} image={newsImage(featuredNews, articlesBySlug)} />
                {moreNews.length > 0 && <NewsList news={moreNews} />}
              </div>
            ) : (
              <NewsList news={[]} />
            )}
          </Section>

          {/* lg+: la encuesta a la izquierda (3/5) y la criatura de la semana a la derecha, como tarjeta. */}
          <div className="space-y-14 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-8 lg:space-y-0">
            {poll && <PollTile initialPoll={poll} fighters={fighterCards} nextPoll={nextPoll} />}

            {creature && (
              <Section id="criatura-semana" title="Criatura de la semana" contained={false}>
                <div className="lg:hidden">
                  <CommunityCreatureRow creature={creature} />
                </div>
                <div className="hidden lg:block">
                  <ContentCard
                    href={`/wiki/${creature.slug}`}
                    title={creature.frontmatter.title}
                    meta={[creature.frontmatter.category, creature.frontmatter.universe].filter(Boolean).join(' · ')}
                    image={creature.frontmatter.image}
                    imagePosition={creature.frontmatter.imagePosition}
                    category={creature.frontmatter.category}
                    headingLevel={3}
                    sizes="(min-width: 1024px) 440px, 100vw"
                  />
                </div>
              </Section>
            )}
          </div>

          {videos.length > 0 && (
            <Section
              id="videos"
              title="Últimos vídeos"
              action={{ href: SOCIAL_LINKS.youtube, label: 'Ver el canal', external: true }}
              contained={false}
            >
              {videos.length === 1 ? (
                <VideoCard video={videos[0]} sizes="(min-width: 768px) 448px, 100vw" className="max-w-md" />
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {videos.map((video) => (
                    <li key={video.id}>
                      <VideoCard video={video} sizes="(min-width: 1024px) 272px, (min-width: 640px) 50vw, 100vw" />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <PollHistoryTiles fighters={fighterCards} />

          <Section
            id="tu-registro"
            title="Tu registro"
            action={{ href: REGISTRO_ROUTE, label: 'Ver el registro' }}
            contained={false}
          >
            <p className="mb-4 text-white/70">El registro se guarda solo en este navegador.</p>
            <RegistroProgress slugs={registroSlugs(entityIndex.entries)} />
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
