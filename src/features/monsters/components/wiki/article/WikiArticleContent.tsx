import { MdxRenderer } from '@/features/monsters/components/wiki/mdx/MdxRenderer';
import {
  WikiInfobox,
  InfoSection,
  InfoField,
} from '@/features/monsters/components/wiki/mdx/WikiInfobox';
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
 * - < lg: infobox flotante a la derecha (md) y TOC inline colapsable, como siempre.
 * - ≥ lg: grid de dos columnas — cuerpo ≤ 800 px + rail derecho con infobox y TOC sticky.
 * El rail es un único wrapper para que en md siga flotando y en lg ocupe la columna 2.
 */
export function WikiArticleContent({ frontmatter, content }: WikiArticleContentProps) {
  const { title, description, image, imageCaption, infobox } = frontmatter;
  const hasInfobox = !!infobox && Object.keys(infobox).length > 0;
  const showStats = hasStats(frontmatter);
  const showRail = hasInfobox || showStats;
  const headings = extractHeadings(content);

  return (
    <div className="wiki-content px-4 md:px-12 py-8 relative z-10">
      <div className="mx-auto max-w-[1180px] lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
        {/* Description / Introduction Box */}
        {description && (
          <div className="mb-6 p-4 bg-[#061a2e]/80 border-l-4 border-primary text-white/80 text-sm md:text-base font-medium rounded-r-lg lg:col-start-1">
            {description}
          </div>
        )}

        {/* Right rail: floats on md, becomes column 2 on lg */}
        <aside className="md:float-right md:ml-8 md:w-[350px] mb-8 md:mb-4 clear-right lg:float-none lg:ml-0 lg:w-auto lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:mb-0">
          {showRail && (
            <WikiInfobox
              title={title}
              image={image}
              imageCaption={imageCaption}
              className="w-full md:w-full md:float-none md:ml-0 mb-0 md:mb-0"
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
          )}
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
