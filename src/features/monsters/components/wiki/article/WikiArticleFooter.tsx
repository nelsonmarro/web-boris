import { WikiArticleCard } from '@/features/monsters/components/wiki/WikiArticleCard';
import type { WikiArticleSummary } from '@/features/monsters/lib/related';

interface WikiArticleFooterProps {
  related?: WikiArticleSummary[];
}

export function WikiArticleFooter({ related = [] }: WikiArticleFooterProps) {
  return (
    <footer className="clear-both px-4 md:px-12 py-8 border-t border-white/10 mt-12 mb-12">
      <div className="mx-auto max-w-[1180px]">
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-12">
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                Navegación cruzada
              </div>
              <h2
                id="related-heading"
                className="text-2xl font-black uppercase italic tracking-tight text-white"
              >
                Archivos relacionados
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <WikiArticleCard
                  key={item.slug}
                  slug={item.slug}
                  frontmatter={item.frontmatter}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Archivo desclasificado // Iniciativa Abisal
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary italic drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]">
            Borisao Archives
          </div>
        </div>
      </div>
    </footer>
  );
}
