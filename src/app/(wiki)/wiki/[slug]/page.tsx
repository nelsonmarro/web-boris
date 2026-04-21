import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticleBySlug, getAllArticles } from "@/utils/mdx";
import { MdxRenderer } from "@/features/monsters/components/wiki/mdx/MdxRenderer";
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
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-28 max-w-5xl">
        <article className="glass-liquid rounded-[3rem] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden relative border-refractive">
          <div className="glass-reflection opacity-20" />
          
          <header className="relative h-[400px] md:h-[550px] w-full overflow-hidden border-b border-white/10 group">
            {frontmatter.image && (
              <Image
                src={frontmatter.image}
                alt={frontmatter.title}
                fill
                className="object-cover opacity-80 transition-transform duration-[3s] group-hover:scale-110"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#00060d] via-[#00060d]/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-10 md:p-16 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="text-[10px] font-black px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
                  {frontmatter.universe}
                </span>
                {frontmatter.category && (
                  <span className="text-[10px] font-black px-4 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
                    {frontmatter.category}
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] uppercase">
                {frontmatter.title}
              </h1>
            </div>
          </header>

          <div className="p-10 md:p-16 relative z-10 bg-gradient-to-b from-white/[0.02] to-transparent">
             {frontmatter.description && (
                <p className="text-xl md:text-2xl text-white/50 font-bold mb-16 leading-relaxed italic border-l-4 border-primary/30 pl-8 drop-shadow-md">
                   &quot;{frontmatter.description}&quot;
                </p>
             )}
             
             <MdxRenderer content={content} />
          </div>

          <footer className="px-10 md:px-16 py-10 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                   Archivo desclasificado // Iniciativa Abisal
                </div>
             </div>
             <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]">
                Borisao Archives
             </div>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
