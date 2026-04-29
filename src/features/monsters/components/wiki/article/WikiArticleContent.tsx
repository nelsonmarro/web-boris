import { MdxRenderer } from "@/features/monsters/components/wiki/mdx/MdxRenderer";
import { WikiInfobox, InfoSection, InfoField } from "@/features/monsters/components/wiki/mdx/WikiInfobox";
import { WikiTOC } from "@/features/monsters/components/wiki/mdx/WikiTOC";
import { WikiFrontmatter } from "@/core/types/wiki";

interface WikiArticleContentProps {
  frontmatter: WikiFrontmatter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export function WikiArticleContent({ frontmatter, content }: WikiArticleContentProps) {
  const { title, description, image, imageCaption, infobox } = frontmatter;

  return (
    <div className="wiki-content px-8 md:px-12 lg:px-16 py-8 relative z-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        {/* Left Column: TOC */}
        <div className="hidden lg:block lg:w-[320px] shrink-0">
          <div className="sticky top-24">
            <WikiTOC />
          </div>
        </div>

        {/* Center Column: Content */}
        <div className="flex-1 min-w-0">
          {description && (
            <div className="mb-8 p-4 bg-[#1a1a1a] border-l-4 border-primary/60 text-white/80 text-sm md:text-base font-medium rounded-r-lg">
              {description}
            </div>
          )}
          
          <div className="lg:hidden mb-8">
            <WikiTOC />
          </div>
          
          {/* Infobox floats on mobile, but on desktop it's right-aligned inside the content. Wait, actually we can just render the infobox right here and let it float if we use the existing WikiInfobox CSS. */}
          {infobox && Object.keys(infobox).length > 0 && (
            <WikiInfobox 
              title={title} 
              image={image}
              imageCaption={imageCaption}
              className="lg:hidden" // Only show on mobile here if we put it in the right column, but let's look at the old layout. The old WikiInfobox has "lg:float-right lg:ml-8 mb-8 lg:mb-4". 
              // Wait, if it has lg:float-right, it should be rendered at the TOP of the content to float properly.
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

          <MdxRenderer content={content} />
        </div>

        {/* Right Column: Infobox (Desktop) */}
        {infobox && Object.keys(infobox).length > 0 && (
          <div className="hidden lg:block lg:w-[350px] shrink-0">
             <div className="sticky top-24">
                <WikiInfobox 
                  title={title} 
                  image={image}
                  imageCaption={imageCaption}
                  className="w-full lg:float-none lg:ml-0 mb-0"
                >
                  {Object.entries(infobox).map(([sectionTitle, fields]) => (
                    <InfoSection key={sectionTitle} title={sectionTitle}>
                      {Object.entries(fields).map(([label, value]) => (
                        <InfoField key={label} label={label} value={value} />
                      ))}
                    </InfoSection>
                  ))}
                </WikiInfobox>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
