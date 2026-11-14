import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { getContentRepository } from '@/core/content';
import { isoWeekKey } from '@/core/content/iso-week';
import { hasStats } from '@/features/monsters/lib/stats';
import { LIST_TITLES, loadList, videoOptions } from '@/features/admin/server/lists';
import { LIST_DESCRIPTIONS, LIST_PUBLIC_PATHS, LIST_ROUTES } from '@/features/admin/lib/list-routes';
import { LocalTime } from '@/features/admin/components/LocalTime';
import { UNIVERSE_OPTIONS } from '@/features/admin/lib/universe-options';
import { SMALL_BUTTON } from '@/features/admin/components/editor/field-styles';
import { NewsEditor } from '@/features/admin/components/lists/NewsEditor';
import { PollsEditor } from '@/features/admin/components/lists/PollsEditor';
import { VideosEditor } from '@/features/admin/components/lists/VideosEditor';
import { StoryOrderEditor } from '@/features/admin/components/lists/StoryOrderEditor';
import { StartHereEditor } from '@/features/admin/components/lists/StartHereEditor';
import { NavigationEditor } from '@/features/admin/components/lists/NavigationEditor';

export const metadata: Metadata = { title: 'Contenido' };

interface Props {
  params: Promise<{ lista: string }>;
  searchParams: Promise<{ version?: string; publicada?: string }>;
}

export default async function AdminListPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { lista } = await params;
  const key = Object.hasOwn(LIST_ROUTES, lista) ? LIST_ROUTES[lista] : undefined;
  if (!key) notFound();
  const { version, publicada } = await searchParams;
  const [state, articles, videos] = await Promise.all([
    loadList(key, typeof version === 'string' ? version : undefined),
    getContentRepository().getArticles(),
    videoOptions(),
  ]);
  const path = `/admin/contenido/${lista}`;
  const common = {
    path,
    token: state.token,
    articles: articles.map((a) => ({ slug: a.slug, title: a.frontmatter.title, fighter: hasStats(a.frontmatter), sealed: a.frontmatter.status === 'proximamente',
      universe: a.frontmatter.universe,
      category: a.frontmatter.category,
    })),
    videos,
    universes: UNIVERSE_OPTIONS,
    currentWeek: isoWeekKey(new Date()),
  };
  // `key` del editor: se monta de nuevo al publicar o al cargar otra versión.
  const editorKey = `${state.token}-${state.restoring ?? ''}`;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/admin/contenido" className="inline-flex min-h-10 items-center text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary">
          ← Resto del contenido
        </Link>
        <h1 className="text-3xl font-bold text-white">{LIST_TITLES[key]}</h1>
        <p className="text-white/80">{LIST_DESCRIPTIONS[key]}</p>
        {publicada ? (
          <p role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-white">
            Publicado. Ya se ve en la web:{' '}
            <a href={LIST_PUBLIC_PATHS[key]} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 hover:text-primary">
              verlo<span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            .
          </p>
        ) : null}
        {state.restoring ? (
          <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-white">
            Has cargado una versión anterior. Revísala y pulsa «Publicar» para recuperarla, o{' '}
            <Link href={path as Route} className="font-semibold underline underline-offset-4 hover:text-primary">
              vuelve a la actual
            </Link>
            .
          </p>
        ) : null}
      </div>

      {state.key === 'news' ? <NewsEditor key={editorKey} {...common} initial={state.value} /> : null}
      {state.key === 'polls' ? <PollsEditor key={editorKey} {...common} initial={state.value} /> : null}
      {state.key === 'videos' ? <VideosEditor key={editorKey} {...common} initial={state.value} /> : null}
      {state.key === 'storyOrder' ? <StoryOrderEditor key={editorKey} {...common} initial={state.value} /> : null}
      {state.key === 'startHere' ? <StartHereEditor key={editorKey} {...common} initial={state.value} /> : null}
      {state.key === 'navigation' ? <NavigationEditor key={editorKey} {...common} initial={state.value} /> : null}

      <section aria-labelledby="historial" className="space-y-4 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5 @2xl:p-6">
        <h2 id="historial" className="text-xl font-bold text-white">
          Historial
        </h2>
        {state.versions.length === 0 ? (
          <p className="text-white/70">Aún no se ha publicado nada desde el panel: la web muestra la lista original.</p>
        ) : (
          <ol className="divide-y divide-white/10">
            {state.versions.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white">
                    {index === 0 ? 'Publicada (la que se ve ahora)' : 'Publicada'}
                    {item.note ? ` — ${item.note}` : ''}
                  </p>
                  <p className="text-sm text-white/70">
                    <LocalTime iso={item.createdAt} />
                    {item.author ? ` · ${item.author}` : ''}
                  </p>
                </div>
                {index > 0 ? (
                  <Link href={`${path}?version=${item.id}` as Route} className={SMALL_BUTTON}>
                    Cargar esta versión<span className="sr-only"> del <LocalTime iso={item.createdAt} /></span>
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
