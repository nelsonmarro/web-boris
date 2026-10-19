import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticles } from '@/utils/mdx';
import { WikiArticleHeader } from '@/features/monsters/components/wiki/article/WikiArticleHeader';
import { WikiArticleContent } from '@/features/monsters/components/wiki/article/WikiArticleContent';
import { WikiArticleFooter } from '@/features/monsters/components/wiki/article/WikiArticleFooter';
import type { Metadata } from 'next';
import { hasStats } from '@/features/monsters/lib/stats';
import { getRelatedArticles } from '@/features/monsters/lib/related';
import { getEntityIndex } from '@/core/content/entities';
import { extractHeadings } from '@/utils/headings';
import { ArticleProgress } from '@/features/monsters/components/wiki/article/ArticleProgress';
import { SectionChip } from '@/features/monsters/components/wiki/article/SectionChip';
import { ArticleImagesProvider } from '@/features/monsters/components/wiki/mdx/ArticleImages';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return {
    title: `${article.frontmatter.title} | Wiki BorisaoBlois`,
    description:
      article.frontmatter.description ||
      `Explora el lore de ${article.frontmatter.title} en el universo de BorisaoBlois.`,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      images: article.frontmatter.image
        ? [{ url: article.frontmatter.image }]
        : [],
    },
  };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;
  const related = getRelatedArticles(slug, await getAllArticles());
  const entityIndex = await getEntityIndex();
  // La portada sube a la cabecera; si el MDX ya la usa en el cuerpo, la cabecera no la repite.
  const imageInBody = !!frontmatter.image && content.includes(frontmatter.image);
  const withStats = hasStats(frontmatter);

  return (
    <div className="w-full min-h-screen bg-[#0a2339]">
      <article className="w-full">
        <ArticleProgress />
        <SectionChip headings={extractHeadings(content)} />
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
          hasStats={withStats}
          imageInBody={imageInBody}
        />

        <ArticleImagesProvider>
          <WikiArticleContent
            frontmatter={frontmatter}
            content={content}
            slug={slug}
            entityIndex={entityIndex}
          />
        </ArticleImagesProvider>

        <WikiArticleFooter related={related} />
      </article>
    </div>
  );
}
