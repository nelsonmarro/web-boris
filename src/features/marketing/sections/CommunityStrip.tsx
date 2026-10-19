import Link from 'next/link';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';

const LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-bold text-primary transition-colors hover:text-orange-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** Franja de una línea hacia /comunidad y la Arena (spec #55 §3.4). Los nombres del duelo salen de los artículos con stats; una votación «desclasificar» no nombra a nadie. */
export async function CommunityStrip() {
  const weekly = await getWeeklyPoll();
  const names = new Map(weekly.fighters.map((a) => [a.slug, a.frontmatter.title]));
  const poll = weekly.poll;

  return (
    <section aria-label="Comunidad" className="container mx-auto px-6">
      <div className="crystal-surface flex flex-col gap-3 rounded-2xl px-6 py-5 md:flex-row md:items-center md:justify-between">
        {poll ? (
          <div className="flex flex-col gap-x-6 gap-y-1 md:flex-row md:items-center">
            {poll.tipo === 'desclasificar' ? (
              <p className="text-white">Votación de la semana: ¿qué expediente se desclasifica primero?</p>
            ) : (
              <p className="text-white">
                Duelo de la semana: <strong>{names.get(poll.a) ?? poll.a}</strong> vs <strong>{names.get(poll.b) ?? poll.b}</strong>
              </p>
            )}
            <Link href="/comunidad" className={LINK}>
              Votar <span aria-hidden="true">›</span>
            </Link>
          </div>
        ) : (
          <p className="text-white">Versus Arena: enfrenta a los colosos</p>
        )}
        <Link href="/wiki/arena" className={LINK}>
          Abrir la Arena <span aria-hidden="true">›</span>
        </Link>
      </div>
    </section>
  );
}
