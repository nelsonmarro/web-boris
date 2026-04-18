import { notFound } from "next/navigation";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug } from "@/utils/mdx";
import { ArticleModal } from "@/features/monsters/components/ArticleModal";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function WikiArticleModalPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;

  return (
    <ArticleModal title={frontmatter.title} description={frontmatter.description}>
      <article className="bg-transparent">
        <header className="mb-8 text-center">
          <div className="flex justify-center gap-3 mb-4">
            <span className="text-xs font-bold px-3 py-1 bg-primary/20 text-primary rounded-full">
              {frontmatter.universe}
            </span>
            {frontmatter.category && (
              <span className="text-xs font-semibold px-3 py-1 bg-secondary/20 text-secondary rounded-full">
                {frontmatter.category}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            {frontmatter.title}
          </h1>
          {frontmatter.image && (
            <div className="relative h-48 md:h-72 w-full rounded-xl overflow-hidden shadow-xl mt-6">
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

        <div className="prose prose-invert prose-base md:prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
          <MDXRemote source={content} />
        </div>
      </article>
    </ArticleModal>
  );
}
