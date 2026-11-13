import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { loadArticleEditor } from '@/features/admin/server/articles';
import { readArticlePreview } from '@/features/admin/server/preview';
import { isValidSlug } from '@/core/content/overlay';
import { getEntityIndex } from '@/core/content/entities';
import { hasStats } from '@/features/monsters/lib/stats';
import { WikiArticleHeader } from '@/features/monsters/components/wiki/article/WikiArticleHeader';
import { WikiArticleContent } from '@/features/monsters/components/wiki/article/WikiArticleContent';
import { ArticleImagesProvider } from '@/features/monsters/components/wiki/mdx/ArticleImages';

export const metadata: Metadata = { title: 'Vista previa' };

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ vivo?: string; embed?: string }>;
}

/**
 * La ficha tal como se verá en la web (cabecera y cuerpo), solo con sesión del panel. Con `?vivo=1`, lo que se está
 * editando aunque no se haya guardado (`stashArticlePreview`); si no hay nada, el borrador o lo publicado. `?embed=1`
 * es la vista previa al lado del editor: sin la barra de arriba. Va fuera del grupo `(panel)`: sin su cabecera.
 */
export default async function ArticlePreviewPage({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const { vivo, embed } = await searchParams;
  const state = await loadArticleEditor(slug);
  if (!state) notFound();
  const live = vivo ? readArticlePreview(admin.id, slug) : null;
  const { frontmatter, content } = live ?? state.data;
  const withStats = hasStats(frontmatter);

  return (
    <div>
      {embed ? null : (
        <div className="flex flex-wrap items-center gap-3 border-b border-amber-400/40 bg-amber-500/15 px-4 py-3 text-white">
          <p className="min-w-0 flex-1 font-semibold">
            Vista previa {live ? 'de lo que estás editando' : state.hasDraft ? 'del borrador' : '(sin cambios pendientes)'}: así se verá la ficha. Aún no está en la web.
          </p>
          <Link href={`/admin/fichas/${slug}` as Route} className="font-semibold underline underline-offset-4 hover:text-primary">
            Volver al editor
          </Link>
        </div>
      )}
      <article className="w-full bg-[#0a2339]">
        <WikiArticleHeader
          title={frontmatter.title}
          universe={frontmatter.universe}
          category={frontmatter.category}
          status={frontmatter.status}
          arenaSlug={withStats ? slug : undefined}
          image={frontmatter.image}
          imagePosition={frontmatter.imagePosition}
          imageCaption={frontmatter.imageCaption}
          description={frontmatter.description}
          stats={frontmatter.stats}
          infobox={frontmatter.infobox}
          hasStats={withStats}
          imageInBody={!!frontmatter.image && content.includes(frontmatter.image)}
        />
        <ArticleImagesProvider>
          <WikiArticleContent frontmatter={frontmatter} content={content} slug={slug} entityIndex={await getEntityIndex()} />
        </ArticleImagesProvider>
      </article>
    </div>
  );
}
