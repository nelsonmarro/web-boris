import { MdxRenderer } from '@/features/monsters/components/wiki/mdx/MdxRenderer';
import {
  WikiInfobox,
  InfoSection,
  InfoField,
} from '@/features/monsters/components/wiki/mdx/WikiInfobox';
import { WikiInfoboxCompact } from '@/features/monsters/components/wiki/mdx/WikiInfoboxCompact';
import { InfoStats } from '@/features/monsters/components/wiki/mdx/InfoStats';
import { WikiTOC } from '@/features/monsters/components/wiki/mdx/WikiTOC';
import { WikiFrontmatter } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';
import { extractHeadings } from '@/utils/headings';

interface WikiArticleContentProps {
  frontmatter: WikiFrontmatter;
  content: string;
}

/**
 * Shell de lectura:
 * - < lg: ficha compacta tras la descripción, con la infobox completa plegada, y TOC inline colapsable.
 *   Nada flota por debajo de lg: con la sidebar abierta la columna de contenido es demasiado estrecha.
 * - ≥ lg: grid de dos columnas — cuerpo ≤ 800 px + rail derecho con infobox y TOC sticky.
 */
export function WikiArticleContent({ frontmatter, content }: WikiArticleContentProps) {
  const { title, description, image, imageCaption, infobox } = frontmatter;
  const hasInfobox = !!infobox && Object.keys(infobox).length > 0;
  const showStats = hasStats(frontmatter);
  const showRail = hasInfobox || showStats;
  const headings = extractHeadings(content);

  const infoboxFull = showRail ? (
    <WikiInfobox
      title={title}
      image={image}
      imageCaption={imageCaption}
      className="w-full mb-0"
    >
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
      <div className="wiki-container lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
        {/* Description / Introduction Box */}
        {description && (
          <div className="mb-6 rounded-r-xl border-l-4 border-primary bg-[#061a2e]/80 p-5 text-base font-medium leading-relaxed text-white/80 lg:col-start-1">
            {description}
          </div>
        )}

        {/* < lg: ficha compacta tras la descripción */}
        {infoboxFull && (
          <div className="lg:hidden">
            <WikiInfoboxCompact frontmatter={frontmatter}>{infoboxFull}</WikiInfoboxCompact>
          </div>
        )}

        {/* ≥ lg: rail en la columna 2 */}
        <aside className="hidden lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:block">
          {infoboxFull}
          {headings.length > 0 && (
            <div className="hidden lg:block lg:sticky lg:top-20 mt-6">
              <WikiTOC headings={headings} variant="rail" />
            </div>
          )}
        </aside>

        {/* TOC inline (< lg) */}
        <div className="lg:hidden lg:col-start-1">
          <WikiTOC headings={headings} variant="inline" />
        </div>

        {/* Main Content */}
        <div className="min-w-0 lg:col-start-1 lg:max-w-[800px]">
          <MdxRenderer content={content} />
        </div>

        {/* Clearfix to ensure container wraps floated elements */}
        <div className="clear-both lg:col-span-2"></div>
      </div>
    </div>
  );
}
