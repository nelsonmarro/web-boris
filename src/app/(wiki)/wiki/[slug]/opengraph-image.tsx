import { notFound } from 'next/navigation';
import { getContentRepository } from '@/core/content';
import { renderFichaOgImage } from '@/features/monsters/og/FichaOgImage';
import { OG_HEIGHT, OG_WIDTH } from '@/features/monsters/og/og-layout';

// Imagen para compartir de cada ficha (spec UX fase 2 §6). Next la enlaza en `og:image` y, como la ficha no fija
// `twitter.images`, también en `twitter:image`. Las de los archivos se generan en el build; la de una ficha creada o
// cambiada en el panel, en su primera visita tras publicarla.
export const alt = 'Expediente de la wiki de los universos de BorisaoBlois';
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = 'image/png';
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getContentRepository().getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getContentRepository().getArticle(slug);
  if (!article) notFound();
  return renderFichaOgImage(article);
}
