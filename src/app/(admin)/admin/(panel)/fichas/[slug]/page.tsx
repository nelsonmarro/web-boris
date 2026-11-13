import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { listArticles, loadArticleEditor } from '@/features/admin/server/articles';
import { deleteArticle, restoreArticleVersion, undeleteArticle } from '@/features/admin/actions/articles';
import { ArticleEditor } from '@/features/admin/components/editor/ArticleEditor';
import { DANGER_BUTTON, SMALL_BUTTON } from '@/features/admin/components/editor/field-styles';
import { ARTICLE_CATEGORIES } from '@/features/admin/lib/article-template';
import { UNIVERSE_OPTIONS } from '@/features/admin/lib/universe-options';
import { isValidSlug } from '@/core/content/overlay';

export const metadata: Metadata = { title: 'Editar ficha' };

const dateTime = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' });

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ restaurada?: string; publicada?: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const [state, all, { restaurada, publicada }] = await Promise.all([loadArticleEditor(slug), listArticles(), searchParams]);
  if (!state) notFound();

  const options = all.filter((article) => article.status !== 'borrada' && article.status !== 'nueva').map(({ slug: s, title }) => ({ slug: s, title }));

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/admin/fichas" className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary">
          ← Todas las fichas
        </Link>
        <h1 className="text-3xl font-bold text-white">{state.data.frontmatter.title}</h1>
        <p className="text-white/80">
          {state.deleted ? (
            'Retirada de la web: no se ve en ninguna parte.'
          ) : state.live ? (
            <>
              En la web:{' '}
              <a href={`/wiki/${slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4 hover:text-primary">
                /wiki/{slug}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </>
          ) : (
            'Todavía no está publicada.'
          )}
        </p>
        {state.draftUnreadable ? (
          <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-white">
            El borrador guardado no se pudo leer; estás editando lo publicado.
          </p>
        ) : null}
        {publicada ? (
          <p role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-white">
            Publicada. Ya se ve en la web.
          </p>
        ) : null}
        {restaurada ? (
          <p role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-white">
            Versión copiada al borrador. Revísala y pulsa «Publicar» para que salga en la web.
          </p>
        ) : null}
      </div>

      <ArticleEditor
        key={state.token}
        slug={slug}
        initial={state.data}
        token={state.token}
        hasDraft={state.hasDraft}
        universes={UNIVERSE_OPTIONS}
        categories={[...ARTICLE_CATEGORIES]}
        articles={options}
      />

      <section aria-labelledby="historial" className="space-y-4 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5 @2xl:p-6">
        <h2 id="historial" className="text-xl font-bold text-white">
          Historial
        </h2>
        {state.versions.length === 0 ? (
          <p className="text-white/70">
            {state.inFile ? 'Aún no se ha publicado ningún cambio desde el panel: la web muestra la versión original.' : 'Aún no se ha publicado.'}
          </p>
        ) : (
          <ol className="divide-y divide-white/10">
            {state.versions.map((version, index) => (
              <li key={version.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white">
                    {version.isDeletion ? 'Retirada de la web' : index === 0 && !state.deleted ? 'Publicada (la que se ve ahora)' : 'Publicada'}
                    {version.note && !version.isDeletion ? ` — ${version.note}` : ''}
                  </p>
                  <p className="text-sm text-white/70">
                    <time dateTime={version.createdAt}>{dateTime.format(new Date(version.createdAt))} UTC</time>
                    {version.author ? ` · ${version.author}` : ''}
                  </p>
                </div>
                {!version.isDeletion ? (
                  <form action={restoreArticleVersion.bind(null, slug, version.id)}>
                    <button type="submit" className={SMALL_BUTTON}>
                      Recuperar en el borrador<span className="sr-only"> la versión del {dateTime.format(new Date(version.createdAt))}</span>
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="retirar" className="space-y-3 rounded-2xl border border-red-400/30 p-5 @2xl:p-6">
        <h2 id="retirar" className="text-xl font-bold text-white">
          {state.deleted ? 'Volver a mostrar' : 'Retirar de la web'}
        </h2>
        {state.deleted ? (
          <form action={undeleteArticle.bind(null, slug)} className="space-y-3">
            <p className="text-white/80">La ficha vuelve a verse en la web tal como estaba antes de retirarla.</p>
            <button type="submit" className={SMALL_BUTTON}>
              Volver a mostrar en la web
            </button>
          </form>
        ) : (
          <form action={deleteArticle.bind(null, slug)} className="space-y-3">
            <p className="text-white/80">
              Deja de verse en la web, en los listados y en la búsqueda. No se borra nada: puedes volver a mostrarla cuando quieras.
            </p>
            <button type="submit" className={DANGER_BUTTON}>
              Retirar «{state.data.frontmatter.title}» de la web
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
