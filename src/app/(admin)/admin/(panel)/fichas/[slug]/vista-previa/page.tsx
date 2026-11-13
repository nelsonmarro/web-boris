import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { loadArticleEditor } from '@/features/admin/server/articles';
import { isValidSlug } from '@/core/content/overlay';
import { getEntityIndex } from '@/core/content/entities';
import { hasStats } from '@/features/monsters/lib/stats';
import { WikiArticleHeader } from '@/features/monsters/components/wiki/article/WikiArticleHeader';
import { WikiArticleContent } from '@/features/monsters/components/wiki/article/WikiArticleContent';
import { ArticleImagesProvider } from '@/features/monsters/components/wiki/mdx/ArticleImages';

export const metadata: Metadata = { title: 'Vista previa' };

/** El borrador tal como se verá en la web (cabecera y cuerpo), solo con sesión del panel. */
export default async function ArticlePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const state = await loadArticleEditor(slug);
  if (!state) notFound();
  const { frontmatter, content } = state.data;
  const withStats = hasStats(frontmatter);

  return (
    <div className="-mx-4 -my-10 space-y-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-amber-400/40 bg-amber-500/15 px-4 py-3 text-white">
        <p className="min-w-0 flex-1 font-semibold">
          Vista previa {state.hasDraft ? 'del borrador' : '(sin cambios pendientes)'}: así se verá la ficha. Aún no está en la web.
        </p>
        <Link href={`/admin/fichas/${slug}` as Route} className="font-semibold underline underline-offset-4 hover:text-primary">
          Volver al editor
        </Link>
      </div>
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
