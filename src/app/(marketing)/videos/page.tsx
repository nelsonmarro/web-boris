import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getEntityIndex } from '@/core/content/entities';
import { normalize } from '@/core/search/entity-index';
import { getChannelVideos, getVideosBySlug } from '@/features/community/data/channel-videos';
import { displayVideoTitle, groupVideosByUniverse, isFeedMissing } from '@/features/community/lib/videos-by-universe';
import { VideoArchive, type ArchiveGroup } from '@/features/community/components/videos/VideoArchive';
import { VIDEO_UNIVERSE_KEYWORDS } from '@/features/community/components/videos/universe-keywords';
import { SOCIAL_LINKS, YOUTUBE_SUBSCRIBE_URL } from '@/features/marketing/config/social';
import { UNIVERSES } from '@/features/marketing/config/universes';
import { formatFecha } from '@/utils/format-date';

/**
 * La lista sale de `canal.json` (`npm run sync:canal`) y del RSS (caché 1 h), que trae los vídeos nuevos sin rebuild,
 * como la ficha y /comunidad. Sin `searchParams`: el orden se elige en el cliente.
 */
export const revalidate = 3600;

const INTRO = 'Los vídeos del canal de BorisaoBlois agrupados por universo, con los expedientes del archivo que salen en cada uno.';

export const metadata: Metadata = pageMetadata({
  title: 'Vídeos | Universos de BorisaoBlois',
  description: INTRO,
  path: '/videos',
});

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#00122E] motion-reduce:transition-none';

const fechaOf = (published?: string) =>
  published && !Number.isNaN(Date.parse(published)) ? formatFecha(new Date(published)) : undefined;

export default async function VideosPage() {
  const [videos, bySlug, index] = await Promise.all([getChannelVideos(), getVideosBySlug(), getEntityIndex()]);
  const universeOf = (slug: string) => index.bySlug.get(slug)?.universe;
  const universeOrder = UNIVERSES.flatMap((u) => (u.universeKey ? [u.universeKey] : []));

  const grouped = groupVideosByUniverse(videos, bySlug, universeOf, universeOrder, VIDEO_UNIVERSE_KEYWORDS);
  const groups: ArchiveGroup[] = grouped.map((group) => {
    const def = UNIVERSES.find((u) => u.universeKey === group.universe);
    return {
      id: group.universe === null ? 'otros-videos' : (def?.id ?? normalize(group.universe).replace(/ /g, '-')),
      title: group.universe === null ? 'Otros vídeos' : (def?.title ?? group.universe),
      videos: group.videos.map((video) => ({
        id: video.id,
        title: displayVideoTitle(video.title),
        published: video.published,
        fecha: fechaOf(video.published),
        short: video.tipo === 'short',
        tipo: video.tipo,
        orden: video.orden,
        fichas: video.fichas.map((slug) => ({ slug, title: index.bySlug.get(slug)?.title ?? slug })),
      })),
    };
  });
  // Sin `canal.json` y con el RSS caído solo quedan los destacados, sin fecha ni tipo.
  const feedMissing = isFeedMissing(videos);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-16 pt-32">
        <div className="mx-auto max-w-6xl space-y-10 px-6">
          <header className="space-y-5">
            <h1 className="page-title text-white">Vídeos</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/70">{INTRO}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={YOUTUBE_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BUTTON} bg-primary text-[#00122E] hover:bg-orange-400`}
              >
                Suscríbete
                <span className="sr-only"> (se abre en YouTube)</span>
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BUTTON} border border-white/15 bg-[#061a2e]/90 text-white hover:border-primary/40 hover:text-primary`}
              >
                Ver el canal
                <span className="sr-only"> (se abre en YouTube)</span>
              </a>
            </div>
            {feedMissing && (
              <p className="max-w-3xl rounded-xl border border-white/15 bg-[#061a2e] px-4 py-3 text-sm text-white/80">
                Ahora mismo no se puede leer la lista completa del canal: de momento, solo los vídeos destacados.
              </p>
            )}
          </header>

          <VideoArchive groups={groups} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
