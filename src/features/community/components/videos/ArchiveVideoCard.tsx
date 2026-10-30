import { useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGE_QUALITY } from '@/utils/image';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';

export interface ArchiveCardVideo {
  id: string;
  title: string;
  /** ISO 8601 o YYYY-MM-DD (RSS o `canal.json`): ordena y va en `<time dateTime>`. */
  published?: string;
  /** La fecha ya formateada en el servidor (`formatFecha`); solo si se conoce. */
  fecha?: string;
  /** YouTube Short: lleva la etiqueta «Short». */
  short?: boolean;
  /** De `canal.json`: con `orden`, ordena los que no tienen fecha (`sortVideosByDate`). */
  tipo?: 'video' | 'short';
  /** De `canal.json`: puesto de publicación dentro de su `tipo` (1 = el más antiguo). */
  orden?: number;
  /** Fichas en las que aparece: chips enlazados. */
  fichas: { slug: string; title: string }[];
}

/** El enlace al vídeo es el título y su `::after` cubre la tarjeta; los chips quedan por encima (`relative z-10`). */
const VIDEO_LINK = "outline-none focus-visible:outline-hidden after:absolute after:inset-0 after:content-['']";

const CHIP_LINK =
  'inline-flex min-h-11 items-center rounded-full focus-visible:outline-hidden focus-visible:*:border-primary focus-visible:*:ring-2 focus-visible:*:ring-primary hover:*:border-primary/40 hover:*:text-primary';

const CHIP =
  'rounded-full border border-white/15 bg-[#061a2e] px-3 py-1 text-[12px] font-bold text-white/80 transition-colors motion-reduce:transition-none';

/**
 * Tarjeta de `/videos`: miniatura `sddefault` (sin pasar por `/_next/image`, como las demás de YouTube), título enlazado
 * a YouTube, fecha y las fichas en las que aparece. Misma forma que `ContentCard`, que no admite elementos interactivos
 * dentro.
 */
export function ArchiveVideoCard({ video, sizes }: { video: ArchiveCardVideo; sizes: string }) {
  const metaId = useId();
  return (
    <div className="crystal-surface flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-200 hover:border-primary/40 has-[[data-video-link]:focus-visible]:border-primary/40 has-[[data-video-link]:focus-visible]:ring-2 has-[[data-video-link]:focus-visible]:ring-primary motion-reduce:transition-none">
      <div className="relative aspect-video w-full overflow-hidden bg-[#00122E]">
        <Image
          quality={IMAGE_QUALITY}
          src={youtubeThumbUrl(video.id)}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 md:p-4">
        <h3 className="font-display text-base font-black uppercase italic leading-tight tracking-tight text-white md:text-lg">
          <a
            href={youtubeWatchUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            data-video-link=""
            className={VIDEO_LINK}
            aria-describedby={video.fecha || video.short ? metaId : undefined}
          >
            {video.title}
            <span className="sr-only"> (se abre en YouTube)</span>
          </a>
        </h3>
        {(video.fecha || video.short) && (
          <p id={metaId} className="text-[12px] font-semibold text-white/55">
            {video.short && 'Short'}
            {video.short && video.fecha && ' · '}
            {video.fecha && <time dateTime={video.published}>{video.fecha}</time>}
          </p>
        )}
        {video.fichas.length > 0 && (
          <ul aria-label="Expedientes en este vídeo" className="relative z-10 mt-auto flex flex-wrap gap-x-2 pt-1">
            {video.fichas.map((ficha) => (
              <li key={ficha.slug}>
                <Link href={`/wiki/${ficha.slug}`} className={CHIP_LINK}>
                  <span className={CHIP}>{ficha.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
