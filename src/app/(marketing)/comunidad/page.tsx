import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { ContentCard, Section } from '@/components/content';
import { CommunityCreatureRow } from '@/features/community/components/CommunityCreatureRow';
import { NewsList } from '@/features/community/components/NewsList';
import { PollTile, type PollFighter } from '@/features/community/components/PollTile';

/** Criatura y duelo cambian cada lunes sin rebuild; el estado de la encuesta se pide aparte, sin caché. */
export const revalidate = 3600;

const INTRO = 'Cada semana: una criatura, un duelo y lo último de BorisaoBlois.';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const metadata: Metadata = {
  title: 'Comunidad | Universos de BorisaoBlois',
  description: INTRO,
  openGraph: { title: 'Comunidad | Universos de BorisaoBlois', description: INTRO, url: '/comunidad' },
};

export default async function ComunidadPage() {
  const repo = getContentRepository();
  const [articles, weekly, news, video] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    repo.getNews(5),
    getLatestVideo(),
  ]);
  const { poll, fighters } = weekly;
  const fighterCards: Record<string, PollFighter> = Object.fromEntries(
    fighters.map((a) => [
      a.slug,
      {
        slug: a.slug,
        title: a.frontmatter.title,
        image: a.frontmatter.image,
        imagePosition: a.frontmatter.imagePosition,
        category: a.frontmatter.category,
      },
    ]),
  );

  const creature = pickFeatured(articles);
  const videoDate = video.published && !Number.isNaN(Date.parse(video.published)) ? dateFormat.format(new Date(video.published)) : undefined;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-16 pt-32">
        {/* Una columna, ordenada por importancia (spec #55 §6): encuesta, criatura, vídeo, novedades. */}
        <div className="mx-auto max-w-3xl space-y-14 px-6">
          <header className="space-y-4">
            <h1 className="page-title text-white">Comunidad</h1>
            <p className="text-lg leading-relaxed text-white/70">{INTRO}</p>
          </header>

          {poll && <PollTile initialPoll={poll} fighters={fighterCards} />}

          {creature && (
            <Section id="criatura-semana" title="Criatura de la semana" contained={false}>
              <CommunityCreatureRow creature={creature} />
            </Section>
          )}

          <Section id="ultimo-video" title={video.source === 'fallback' ? 'Vídeo destacado' : 'Último vídeo'} contained={false}>
            <ContentCard
              external
              href={`https://www.youtube.com/watch?v=${video.id}`}
              title={video.title}
              meta={videoDate}
              image={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
              sizes="(min-width: 768px) 448px, 100vw"
              className="max-w-md"
            />
          </Section>

          <Section id="novedades" title="Novedades" contained={false}>
            <NewsList news={news} />
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
