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
      <article className="w-full">
        <header className="mb-10 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-wider font-black px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full">
              {frontmatter.universe}
            </span>
            {frontmatter.category && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full">
                {frontmatter.category}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
            {frontmatter.title}
          </h1>
          {frontmatter.image && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mt-8 border border-white/10">
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

        <div className="prose prose-invert prose-blue max-w-none md:prose-lg prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-img:rounded-2xl prose-img:shadow-lg prose-strong:text-foreground">
          <MDXRemote source={content} />
        </div>
      </article>
    </ArticleModal>
  );
}
