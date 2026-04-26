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
    <div className="w-full min-h-screen bg-[#061a2e]">
      <article className="w-full">
        <WikiArticleHeader 
          title={frontmatter.title} 
          universe={frontmatter.universe} 
          category={frontmatter.category} 
        />

        <div className="max-w-[1400px] mx-auto w-full">
          <WikiArticleContent 
            description={frontmatter.description} 
            content={content} 
          />
        </div>

        <div className="max-w-[1400px] mx-auto w-full pb-20">
          <WikiArticleFooter />
        </div>
      </article>
    </div>
  );
}
