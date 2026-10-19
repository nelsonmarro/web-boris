import { MdxRenderer } from '@/features/monsters/components/wiki/mdx/MdxRenderer';
import {
  WikiInfobox,
  InfoSection,
  InfoField,
} from '@/features/monsters/components/wiki/mdx/WikiInfobox';
import { InfoStats } from '@/features/monsters/components/wiki/mdx/InfoStats';
import { Proximamente } from '@/features/monsters/components/wiki/mdx/Proximamente';
import { WikiTOC } from '@/features/monsters/components/wiki/mdx/WikiTOC';
import { WikiArticleDisclosures } from '@/features/monsters/components/wiki/article/WikiArticleDisclosures';
import { WikiFrontmatter } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';
import { extractHeadings } from '@/utils/headings';

interface WikiArticleContentProps {
  frontmatter: WikiFrontmatter;
  content: string;
}

/**
 * Shell de lectura (la portada, los datos clave y la entradilla viven en `WikiArticleHeader`):
 * El layout depende del ANCHO DEL CONTENEDOR del artículo (`@container/article`), no del viewport:
 * con la sidebar abierta a 1024–1279 px el viewport es "lg" pero la columna de lectura sigue siendo estrecha.
 * - contenedor < 64rem (@5xl): una fila con dos desplegables ("Ficha completa" y "Contenido"), solo uno abierto
 *   a la vez, y el cuerpo en una sola columna. Nada flota.
 * - contenedor ≥ 64rem (@5xl): grid de dos columnas — cuerpo ≤ 800 px + rail derecho con infobox y TOC sticky.
 */
export function WikiArticleContent({ frontmatter, content }: WikiArticleContentProps) {
  const { title, infobox } = frontmatter;
  const hasInfobox = !!infobox && Object.keys(infobox).length > 0;
  const showStats = hasStats(frontmatter);
  const showRail = hasInfobox || showStats;
  const headings = extractHeadings(content);

  // La portada va arriba (cabecera): la infobox no la repite.
  const infoboxFull = showRail ? (
    <WikiInfobox title={title} className="w-full mb-0">
      {hasInfobox &&
        Object.entries(infobox).map(([sectionTitle, fields]) => (
          <InfoSection key={sectionTitle} title={sectionTitle}>
            {Object.entries(fields).map(([label, value]) => (
              <InfoField key={label} label={label} value={value} />
            ))}
          </InfoSection>
        ))}
      {showStats && <InfoStats stats={frontmatter.stats} />}
    </WikiInfobox>
  ) : null;

  return (
    <div className="wiki-content relative z-10 py-8 lg:py-10">
      {/* `wiki-container` aporta max-width + padding; el container query va en un hijo para medir el content box. */}
      <div className="wiki-container">
        <div className="@container/article">
          <div className="@5xl/article:grid @5xl/article:grid-cols-[minmax(0,1fr)_340px] @5xl/article:gap-x-10">
            {/* Contenedor < @5xl: ficha completa e índice, plegados en una sola fila */}
            {(infoboxFull || headings.length > 0) && (
              <div className="@5xl/article:hidden">
                <WikiArticleDisclosures ficha={infoboxFull} headings={headings} />
              </div>
            )}

            {/* Contenedor ≥ @5xl: rail en la columna 2 */}
            <aside className="hidden @5xl/article:col-start-2 @5xl/article:row-start-1 @5xl/article:row-span-3 @5xl/article:block">
              {infoboxFull}
              {headings.length > 0 && (
                <div className="mt-6 @5xl/article:sticky @5xl/article:top-20">
                  <WikiTOC headings={headings} variant="rail" />
                </div>
              )}
            </aside>

            {/* Main Content */}
            <div className="@container min-w-0 @5xl/article:col-start-1 @5xl/article:max-w-[800px]">
              <MdxRenderer content={content} />
              {/* Artículo sin lore canónico: lo conocido primero, luego el aviso */}
              {frontmatter.status === 'proximamente' && <Proximamente />}
            </div>

            {/* Clearfix to ensure container wraps floated elements */}
            <div className="clear-both @5xl/article:col-span-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
