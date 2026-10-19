import { ContentCard, Section } from '@/components/content';
import { cn } from '@/utils/cn';
import type { WikiArticleSummary } from '@/features/monsters/lib/related';

interface WikiArticleFooterProps {
  related?: WikiArticleSummary[];
}

export function WikiArticleFooter({ related = [] }: WikiArticleFooterProps) {
  return (
    <footer className="clear-both mt-8 border-t border-white/10">
      <div className="wiki-container">
        {related.length > 0 && (
          // `data-related` marca el inicio de los relacionados: `SectionChip` se oculta al entrar en la ventana.
          <div data-related>
            {/* Dentro de `wiki-container` la sección no trae su propio contenedor ni margen lateral. */}
            <Section title="Archivos relacionados" contained={false} className="py-10 md:py-14">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {related.map(({ slug, frontmatter }, index) => (
                  <ContentCard
                    key={slug}
                    href={`/wiki/${slug}`}
                    title={frontmatter.title}
                    meta={frontmatter.category}
                    category={frontmatter.category}
                    image={frontmatter.image}
                    imagePosition={frontmatter.imagePosition}
                    pending={frontmatter.status === 'proximamente'}
                    lines={1}
                    sizes="(min-width: 768px) 360px, 50vw"
                    // 2 columnas en el móvil (4 tarjetas = 2×2) y 3 desde md: la cuarta no se muestra para no dejar una huérfana.
                    className={index === 3 ? 'md:hidden' : undefined}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}

        <div
          className={cn(
            'flex flex-col items-center justify-between gap-4 py-8 md:flex-row',
            related.length > 0 && 'border-t border-white/10',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            </div>
            <span className="eyebrow text-white/60">Archivo desclasificado · Iniciativa Abisal</span>
          </div>
          <span className="eyebrow italic text-primary">Borisao Archives</span>
        </div>
      </div>
    </footer>
  );
}
