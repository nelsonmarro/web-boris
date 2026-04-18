import { notFound } from "next/navigation";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticleBySlug, getAllArticles } from "@/utils/mdx";
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
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <article className="bg-card border border-border rounded-2xl p-6 md:p-12 shadow-lg">
          <header className="mb-10 text-center">
            <div className="flex justify-center gap-3 mb-4">
              <span className="text-sm font-bold px-3 py-1 bg-primary/20 text-primary rounded-full">
                {frontmatter.universe}
              </span>
              {frontmatter.category && (
                <span className="text-sm font-semibold px-3 py-1 bg-secondary/20 text-secondary rounded-full">
                  {frontmatter.category}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              {frontmatter.title}
            </h1>
            {frontmatter.image && (
              <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-xl mt-8">
                <Image
                  src={frontmatter.image}
                  alt={frontmatter.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            <MDXRemote source={content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
