import { notFound } from 'next/navigation';
import { getContentRepository } from '@/core/content';
import { WikiArticleHeader } from '@/features/monsters/components/wiki/article/WikiArticleHeader';
import { WikiArticleContent } from '@/features/monsters/components/wiki/article/WikiArticleContent';
import { WikiArticleFooter } from '@/features/monsters/components/wiki/article/WikiArticleFooter';
import type { Metadata } from 'next';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { hasStats } from '@/features/monsters/lib/stats';
import { getRelatedArticles } from '@/features/monsters/lib/related';
import { getEntityIndex, getMentionGraph } from '@/core/content/entities';
import { appendHeading, extractHeadings } from '@/utils/headings';
import { FAQ_ID, FAQ_TITLE, faqJsonLd, serializeJsonLd } from '@/features/monsters/lib/faq';
import { ArticleProgress } from '@/features/monsters/components/wiki/article/ArticleProgress';
import { SectionChip } from '@/features/monsters/components/wiki/article/SectionChip';
import { ArticleImagesProvider } from '@/features/monsters/components/wiki/mdx/ArticleImages';
import { MarkSeen } from '@/features/monsters/components/wiki/article/MarkSeen';
import { EntityPreview } from '@/features/monsters/components/wiki/article/EntityPreview';
import { ApareceEn } from '@/features/monsters/components/wiki/article/ApareceEn';
import { ArticleVideo } from '@/features/monsters/components/wiki/article/ArticleVideo';
import { ArticleNeighbors } from '@/features/monsters/components/wiki/article/ArticleNeighbors';
import { getVideosForSlug } from '@/features/community/data/channel-videos';

// ISR: la encuesta de la semana (expediente sellado) y los vídeos del canal ("Aparece en") cambian con el tiempo.
export const revalidate = 3600;
// Todos los MDX se generan en el build (`generateStaticParams`): un slug desconocido responde un 404 real, no un 200 con
// la página not-found (el `loading.tsx` de la wiki empieza a emitir antes de `notFound()`).
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getContentRepository().getArticle(slug);

  if (!article) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return pageMetadata({
    title: `${article.frontmatter.title} | Wiki BorisaoBlois`,
    description:
      article.frontmatter.description ||
      `Explora el lore de ${article.frontmatter.title} en el universo de BorisaoBlois.`,
    path: `/wiki/${slug}`,
    // La imagen para compartir es la de `opengraph-image.tsx` (portada, título y datos), no la portada suelta.
    fileImage: true,
  });
}

export async function generateStaticParams() {
  const articles = await getContentRepository().getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getContentRepository().getArticle(slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;
  const related = getRelatedArticles(slug, await getContentRepository().getArticles(), 4, await getMentionGraph());
  const entityIndex = await getEntityIndex();
  const videos = await getVideosForSlug(slug);
  // La portada sube a la cabecera; si el MDX ya la usa en el cuerpo, la cabecera no la repite.
  const imageInBody = !!frontmatter.image && content.includes(frontmatter.image);
  const withStats = hasStats(frontmatter);
  // Preguntas frecuentes (solo si la ficha trae `faq`): datos estructurados `FAQPage` y su entrada en el chip de sección.
  const faqLd = faqJsonLd(frontmatter.faq, `${SITE_URL}/wiki/${slug}`);
  const headings = faqLd ? appendHeading(extractHeadings(content), FAQ_ID, FAQ_TITLE) : extractHeadings(content);

  return (
    <div className="w-full min-h-screen bg-[#0a2339]">
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />}
      <article className="w-full">
        <ArticleProgress />
        {/* El registro solo cuenta expedientes abiertos: un expediente sellado no cuenta (ver `registroSlugs`). */}
        {frontmatter.status !== 'proximamente' && <MarkSeen slug={slug} />}
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
          imageInBody={imageInBody}
        />

        {/* El primer vídeo de la ficha, justo bajo la cabecera (embed ligero: nada de YouTube hasta el clic). */}
        <ArticleVideo videos={videos} />

        <ArticleImagesProvider>
          <WikiArticleContent
            frontmatter={frontmatter}
            content={content}
            slug={slug}
            entityIndex={entityIndex}
          />
        </ArticleImagesProvider>

        {/* Después del cuerpo y antes del pie: el orden de tabulación sigue el de lectura. Es `fixed`, no ocupa lugar. */}
        <SectionChip headings={headings} />
        <EntityPreview />

        {/* Bloque de cierre: `SectionChip` se oculta al llegar al primer `[data-related]`, así que es uno solo. */}
        <div data-related>
          <ApareceEn videos={videos} />
          <ArticleNeighbors slug={slug} />
          <WikiArticleFooter related={related} />
        </div>
      </article>
    </div>
  );
}
