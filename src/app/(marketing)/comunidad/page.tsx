import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { LatestVideoTile } from '@/features/community/components/LatestVideoTile';
import { NewsTile } from '@/features/community/components/NewsTile';
import { PollTile, type PollFighter } from '@/features/community/components/PollTile';

/** Criatura y duelo cambian cada lunes sin rebuild; el estado de la encuesta se pide aparte, sin caché. */
export const revalidate = 3600;

const INTRO = 'Cada semana: una criatura, un duelo y lo último de BorisaoBlois.';

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

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-12 pt-32">
        <div className="container mx-auto px-6">
          <header className="mb-10 max-w-3xl space-y-4">
            <p className="eyebrow text-primary">Comunidad</p>
            <h1 className="page-title text-white">Comunidad</h1>
            <p className="text-lg leading-relaxed text-white/70">{INTRO}</p>
          </header>

          {/* Orden del DOM = orden en móvil. En lg se colocan explícitamente en 3 columnas. */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CreatureOfWeekTile
              creature={pickFeatured(articles)}
              className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
            />
            {poll && (
              <PollTile initialPoll={poll} fighters={fighterCards} className="lg:col-start-3 lg:row-start-1" />
            )}
            <LatestVideoTile video={video} className="lg:col-start-2 lg:row-start-1" />
            <NewsTile news={news} className="lg:col-span-2 lg:col-start-2 lg:row-start-2" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
