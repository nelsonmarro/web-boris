import { MdxRenderer } from "@/features/monsters/components/wiki/mdx/MdxRenderer";

interface WikiArticleContentProps {
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export function WikiArticleContent({ description, content }: WikiArticleContentProps) {
  return (
    <div className="p-8 md:p-16 relative z-10 bg-gradient-to-b from-white/[0.02] to-transparent">
      {description && (
        <p className="text-lg md:text-2xl text-white/50 font-bold mb-12 md:mb-16 leading-relaxed italic border-l-4 border-primary/30 pl-6 md:pl-8 drop-shadow-md">
          &quot;{description}&quot;
        </p>
      )}
      
      <MdxRenderer content={content} />
    </div>
  );
}