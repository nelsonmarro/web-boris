import { MdxRenderer } from '@/features/monsters/components/wiki/mdx/MdxRenderer';
import {
  WikiInfobox,
  InfoSection,
  InfoField,
} from '@/features/monsters/components/wiki/mdx/WikiInfobox';
import { WikiTOC } from '@/features/monsters/components/wiki/mdx/WikiTOC';
import { WikiFrontmatter } from '@/core/types/wiki';

interface WikiArticleContentProps {
  frontmatter: WikiFrontmatter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export function WikiArticleContent({
  frontmatter,
  content,
}: WikiArticleContentProps) {
  const { title, description, image, imageCaption, infobox } = frontmatter;

  return (
    <div className="wiki-content px-4 md:px-12 py-8 relative z-10">
      <div className="mx-auto relative">
        {/* Description / Introduction Box */}
        {description && (
          <div className="mb-6 p-4 bg-[#1a1a1a] border-l-4 border-primary/60 text-white/80 text-sm md:text-base font-medium rounded-r-lg">
            {description}
          </div>
        )}

        {/* Infobox floats on the right side of the content. Must be rendered before main text. */}
        {infobox && Object.keys(infobox).length > 0 && (
          <WikiInfobox
            title={title}
            image={image}
            imageCaption={imageCaption}
            className="w-full md:w-[350px] md:float-right md:ml-8 mb-8 md:mb-4 clear-right"
          >
            {Object.entries(infobox).map(([sectionTitle, fields]) => (
              <InfoSection key={sectionTitle} title={sectionTitle}>
                {Object.entries(fields).map(([label, value]) => (
                  <InfoField key={label} label={label} value={value} />
                ))}
              </InfoSection>
            ))}
          </WikiInfobox>
        )}

        {/* TOC inline with content */}
        <WikiTOC />

        {/* Main Content */}
        <MdxRenderer content={content} />

        {/* Clearfix to ensure container wraps floated elements */}
        <div className="clear-both"></div>
      </div>
    </div>
  );
}
