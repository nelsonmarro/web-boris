import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getContentRepository } from '@/core/content';
import { addWeeks, isoWeekKey } from '@/core/content/iso-week';
import { unlistedSlugs } from '@/core/content/navigation';
import { getNextPoll } from '@/features/community/lib/poll-schedule';
import { hasStats } from '@/features/monsters/lib/stats';
import { LocalTime } from '@/features/admin/components/LocalTime';
import { ArticleBadges } from '@/features/admin/components/StatusBadge';
import { listArticles } from '@/features/admin/server/articles';
import { requireAdmin } from '@/features/admin/server/require-admin';

export const metadata: Metadata = { title: 'Inicio' };

const ACTIVITY: Record<string, string> = {
  'login.ok': 'Entrada al panel',
  'login.fail': 'Intento de entrada fallido',
  'login.throttled': 'Intentos frenados por exceso de fallos',
  logout: 'Sesión cerrada',
  'setup.ok': 'Cuenta configurada (contraseña y 2FA)',
  'setup.fail': 'Código incorrecto al configurar la cuenta',
  'article.create': 'Ficha creada',
  'article.save': 'Borrador guardado',
  'article.publish': 'Ficha publicada',
  'article.discard': 'Borrador descartado',
  'article.delete': 'Ficha retirada de la web',
  'article.undelete': 'Ficha mostrada de nuevo',
  'article.restore-version': 'Versión recuperada en el borrador',
  'media.upload': 'Imagen subida',
  'media.delete': 'Imagen borrada',
  'list.publish': 'Lista publicada',
};

const LINK = 'font-semibold text-white underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const CARD = 'space-y-3 rounded-2xl border p-5';

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const repo = getContentRepository();
  const [activity, all, live, nav, curated] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where: { userId: admin.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, action: true, target: true, createdAt: true },
    }),
    listArticles(),
    repo.getArticles(),
    repo.getNavigation(),
    repo.getCuratedPolls(),
  ]);

  const byRecent = (a: { updatedAt: string | null }, b: { updatedAt: string | null }) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
  const drafts = all.filter((article) => article.hasDraft && article.status !== 'borrada').sort(byRecent);
  const titles = new Map(live.map((article) => [article.slug, article.frontmatter.title]));
  const unlisted = unlistedSlugs(nav, live.map((article) => article.slug));
  const recent = all.filter((article) => article.updatedAt).sort(byRecent).slice(0, 5);

  // Votación de la semana que viene: elegida en «Votaciones» o, si no, el duelo automático.
  const nextWeek = addWeeks(isoWeekKey(new Date()), 1);
  const chosen = curated.some((poll) => poll.semana === nextWeek);
  const nextPoll = getNextPoll(curated, live.filter((article) => hasStats(article.frontmatter)).map((article) => article.slug));
  const pair = nextPoll ? `${titles.get(nextPoll.a) ?? nextPoll.a} contra ${titles.get(nextPoll.b) ?? nextPoll.b}` : null;
  const nothingPending = drafts.length === 0 && unlisted.length === 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Hola{admin.name ? `, ${admin.name}` : ''}</h1>
        <p className="mt-2 text-white/80">Esto es lo que tienes a medias y lo último que se ha editado.</p>
      </div>

      <section aria-labelledby="pendiente" className="space-y-4">
        <h2 id="pendiente" className="text-xl font-bold text-white">
          Pendiente
        </h2>
        {nothingPending ? (
          <p className={`${CARD} border-emerald-400/30 bg-emerald-500/10 text-white`}>Nada a medias: todo lo guardado está publicado y todas las fichas salen en el menú.</p>
        ) : null}

        {drafts.length ? (
          <div className={`${CARD} border-amber-400/40 bg-amber-500/10`}>
            <h3 className="font-bold text-white">
              {drafts.length === 1 ? 'Un borrador sin publicar' : `${drafts.length} borradores sin publicar`}
            </h3>
            <p className="text-sm text-white/80">Están guardados, pero la web todavía no los muestra. Ábrelos y pulsa «Publicar».</p>
            <ul className="divide-y divide-white/10">
              {drafts.map((article) => (
                <li key={article.slug} className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-1 py-2">
                  <Link href={`/admin/fichas/${article.slug}` as Route} className={`${LINK} min-w-0 flex-1`}>
                    {article.title}
                  </Link>
                  {article.updatedAt ? (
                    <span className="text-sm text-white/70">
                      <LocalTime iso={article.updatedAt} style="short" />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {unlisted.length ? (
          <div className={`${CARD} border-amber-400/40 bg-amber-500/10`}>
            <h3 className="font-bold text-white">{unlisted.length === 1 ? 'Una ficha no sale en el menú lateral' : `${unlisted.length} fichas no salen en el menú lateral`}</h3>
            <p className="text-sm text-white/80">Se ven en la web y en la búsqueda, pero no en el menú de la wiki.</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {unlisted.map((slug) => (
                <li key={slug}>
                  <Link href={`/admin/fichas/${slug}` as Route} className={LINK}>
                    {titles.get(slug) ?? slug}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={'/admin/contenido/menu' as Route} className={`${LINK} inline-block text-primary`}>
              Añadirlas en el menú lateral
            </Link>
          </div>
        ) : null}

        <div className={`${CARD} ${chosen ? 'border-white/10 bg-[#061a2e]' : 'border-sky-400/30 bg-sky-500/10'}`}>
          <h3 className="font-bold text-white">Votación de la semana que viene</h3>
          <p className="text-white/80">
            {chosen
              ? `Elegida: ${pair ?? 'lista'}.`
              : pair
                ? `Sin elegir: será el duelo automático ${pair}.`
                : 'Sin elegir, y no hay fichas suficientes con datos de la Arena para un duelo automático.'}
          </p>
          <Link href={'/admin/contenido/votaciones' as Route} className={`${LINK} inline-block text-primary`}>
            {chosen ? 'Ver las votaciones' : 'Elegir la votación'}
          </Link>
        </div>
      </section>

      <section aria-labelledby="recientes" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="recientes" className="text-xl font-bold text-white">
            Últimas fichas editadas
          </h2>
          <Link href="/admin/fichas" className={LINK}>
            Todas las fichas
          </Link>
        </div>
        {recent.length ? (
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#061a2e]">
            {recent.map((article) => (
              <li key={article.slug} className="relative flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 hover:bg-white/5">
                <div className="min-w-0 flex-1 basis-48">
                  <Link href={`/admin/fichas/${article.slug}` as Route} className="font-bold text-white after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    {article.title}
                  </Link>
                  <p className="text-sm text-white/70">
                    <LocalTime iso={article.updatedAt!} style="short" />
                  </p>
                </div>
                <ArticleBadges article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white/80">Todavía no se ha editado ninguna ficha desde el panel.</p>
        )}
      </section>

      <details className="group rounded-2xl border border-white/10 bg-[#061a2e]">
        <summary className="flex min-h-12 cursor-pointer items-center px-5 font-bold text-white hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Actividad reciente de tu cuenta
        </summary>
        <ul className="divide-y divide-white/10 border-t border-white/10">
          {activity.map((entry) => (
            <li key={entry.id} className="flex flex-wrap justify-between gap-2 px-5 py-3">
              <span className="text-white">
                {ACTIVITY[entry.action] ?? entry.action}
                {entry.action.startsWith('article.') && entry.target ? <span className="text-white/70"> · {entry.target.split(' ')[0]}</span> : null}
              </span>
              <span className="text-sm text-white/70">
                <LocalTime iso={entry.createdAt.toISOString()} />
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
