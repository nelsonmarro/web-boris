import { YouTubeLite } from '@/components/content/YouTubeLite';
import { YOUTUBE_SUBSCRIBE_URL } from '@/features/marketing/config/social';
import { youtubeWatchUrl } from '@/utils/youtube';

interface ArticleVideoProps {
  /** Vídeos del canal donde sale la ficha (`getVideosForSlug`); se muestra el primero. */
  videos: { id: string; title: string }[];
}

const LINK =
  'rounded-sm underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary';

/**
 * «Aparece en vídeo» (spec UX fase 1 §B2): el primer vídeo de la ficha justo bajo la cabecera, como embed ligero,
 * con su título enlazado a YouTube y «Suscríbete al canal». Sin vídeos no pinta nada: no se inventa ninguno.
 * Su `h2` no entra en el índice ni en `SectionChip`: ambos salen de `extractHeadings`, que solo lee el MDX.
 * «Aparece en» (todos los vídeos) sigue al final de la ficha.
 */
export function ArticleVideo({ videos }: ArticleVideoProps) {
  const video = videos[0];
  if (!video) return null;
  return (
    <section aria-labelledby="aparece-en-video-titulo" className="border-b border-white/10 print:hidden">
      <div className="wiki-container py-8">
        <div className="max-w-[800px]">
          <h2 id="aparece-en-video-titulo" className="mb-4 text-[13px] font-bold uppercase tracking-wider text-white/70">
            Aparece en vídeo
          </h2>
          <YouTubeLite id={video.id} title={video.title} />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <a
              href={youtubeWatchUrl(video.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-base font-semibold leading-snug text-white hover:text-primary`}
            >
              {video.title}
              <span className="sr-only"> (se abre en YouTube)</span>
            </a>
            <a
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} inline-flex min-h-11 shrink-0 items-center self-start whitespace-nowrap text-[13px] font-bold uppercase tracking-wider text-primary sm:-mt-2.5`}
            >
              Suscríbete al canal<span aria-hidden="true">&nbsp;›</span>
              <span className="sr-only"> (se abre en YouTube)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
