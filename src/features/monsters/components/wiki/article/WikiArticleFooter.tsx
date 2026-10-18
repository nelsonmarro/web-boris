import { WikiArticleCard } from '@/features/monsters/components/wiki/WikiArticleCard';
import { SectionHeader } from '@/features/monsters/components/wiki/SectionHeader';
import type { WikiArticleSummary } from '@/features/monsters/lib/related';

interface WikiArticleFooterProps {
  related?: WikiArticleSummary[];
}

export function WikiArticleFooter({ related = [] }: WikiArticleFooterProps) {
  return (
    <footer className="clear-both mt-8 border-t border-white/10">
      <div className="wiki-container space-y-12 py-10 lg:py-14">
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-8">
            <SectionHeader id="related-heading" eyebrow="Navegación cruzada" title="Archivos relacionados" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <WikiArticleCard key={item.slug} slug={item.slug} frontmatter={item.frontmatter} compact />
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            </div>
            <span className="eyebrow text-white/60">Archivo desclasificado · Iniciativa Abisal</span>
          </div>
          <span className="eyebrow italic text-primary drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]">Borisao Archives</span>
        </div>
      </div>
    </footer>
  );
}
