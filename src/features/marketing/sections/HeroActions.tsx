import { SOCIAL_LINKS, YOUTUBE_SUBSCRIBE_URL } from '../config/social';
import { getLandingLatestVideo } from '../data/landing-latest-video';
import { latestVideoHref } from '../lib/latest-video-link';

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#00122E] motion-reduce:transition-none';

/**
 * Las dos salidas a YouTube del hero (spec UX fase 1 §A.1): «Ver el último vídeo» (primario) y «Suscríbete». Ambos
 * abren una pestaña nueva y lo anuncian a los lectores de pantalla. Sin `hero-rise` propio: lo lleva el contenedor
 * del hero, que no se vuelve a montar cuando el `<Suspense>` sustituye el respaldo por el enlace definitivo.
 */
export function HeroActions({ videoHref }: { videoHref: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={videoHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} bg-primary text-[#00122E] hover:bg-orange-400`}
      >
        Ver el último vídeo
        <span className="sr-only"> (se abre en YouTube)</span>
      </a>
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
  );
}

/** Respaldo mientras llega el RSS (y si falla): la pestaña «Vídeos» del canal. Mismo tamaño: nada salta al llegar. */
export function HeroActionsFallback() {
  return <HeroActions videoHref={latestVideoHref(null, SOCIAL_LINKS.youtube)} />;
}

/** Con el último vídeo del feed (la misma lectura que la sección «Vídeos», `getLandingLatestVideo`). */
export async function HeroLatestVideoActions() {
  const latest = await getLandingLatestVideo();
  return <HeroActions videoHref={latestVideoHref(latest, SOCIAL_LINKS.youtube)} />;
}
