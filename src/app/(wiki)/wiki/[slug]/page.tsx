import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles } from "@/utils/mdx";
import { WikiArticleHeader } from "@/features/monsters/components/wiki/article/WikiArticleHeader";
import { WikiArticleContent } from "@/features/monsters/components/wiki/article/WikiArticleContent";
import { WikiArticleFooter } from "@/features/monsters/components/wiki/article/WikiArticleFooter";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: `${article.frontmatter.title} | Wiki BorisaoBlois`,
    description: article.frontmatter.description || `Explora el lore de ${article.frontmatter.title} en el universo de BorisaoBlois.`,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      images: article.frontmatter.image ? [{ url: article.frontmatter.image }] : [],
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

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 md:py-16 max-w-7xl">
      <article className="glass-liquid rounded-[3rem] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden relative border-refractive">
        <div className="glass-reflection opacity-20" />
        
        <WikiArticleHeader 
          title={frontmatter.title} 
          universe={frontmatter.universe} 
          category={frontmatter.category} 
        />

        <WikiArticleContent 
          description={frontmatter.description} 
          content={content} 
        />

        <WikiArticleFooter />
      </article>
    </div>
  );
}
