import Link from 'next/link';
import type { Route } from 'next';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';

const LINK =
  'inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-primary transition-colors hover:text-orange-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** ¿La encuesta de esta semana pide desclasificar esta ficha? Si el contenido falla, la ficha sigue sin ese enlace. */
async function isInWeeklyDeclassifyPoll(slug: string): Promise<boolean> {
  try {
    const { poll } = await getWeeklyPoll();
    return poll?.tipo === 'desclasificar' && (poll.a === slug || poll.b === slug);
  } catch (error) {
    console.error('[expediente-sellado] no se pudo leer la encuesta de la semana:', error);
    return false;
  }
}

/**
 * Presentación de las fichas `status: proximamente` (sustituye al bloque «Próximamente»). Texto fijo y factual:
 * no explica por qué el expediente está sellado ni insinúa su contenido.
 */
export async function ExpedienteSellado({ slug }: { slug: string }) {
  const inPoll = await isInWeeklyDeclassifyPoll(slug);

  return (
    <section aria-labelledby="expediente-sellado-titulo" className="not-prose crystal-surface clear-both my-8 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
        {/* Sello decorativo: el texto accesible es el h2 de abajo */}
        <span
          aria-hidden="true"
          className="order-first inline-block w-fit -rotate-[4deg] select-none rounded-md border-2 border-primary/70 px-3 py-1.5 font-display text-xs font-black uppercase tracking-[0.2em] text-primary/70 md:order-last md:shrink-0"
        >
          Expediente sellado
        </span>

        <div className="min-w-0">
          <h2 id="expediente-sellado-titulo" className="sr-only">
            Expediente sellado
          </h2>
          <p className="text-lg font-bold leading-snug text-white">Boris aún no ha desclasificado este expediente.</p>

          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-0">
            {inPoll && (
              <li>
                <Link href="/comunidad" className={LINK}>
                  Pide que se desclasifique <span aria-hidden="true">›</span>
                </Link>
              </li>
            )}
            <li>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className={LINK}>
                Sigue el canal <span aria-hidden="true">›</span>
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </li>
            <li>
              <Link href={'/wiki/registro' as Route} className={LINK}>
                Ver el registro <span aria-hidden="true">›</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
