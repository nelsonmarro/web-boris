import { MdxRenderer } from "@/features/monsters/components/wiki/mdx/MdxRenderer";

interface WikiArticleContentProps {
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export function WikiArticleContent({ description, content }: WikiArticleContentProps) {
  return (
    <div className="wiki-content px-8 md:px-12 lg:px-16 py-8 relative z-10">
      {description && (
        <div className="mb-8 p-4 bg-[#1a1a1a] border-l-4 border-primary/60 text-white/80 text-sm md:text-base font-medium rounded-r-lg">
          {description}
        </div>
      )}
      
      <MdxRenderer content={content} />
    </div>
  );
}