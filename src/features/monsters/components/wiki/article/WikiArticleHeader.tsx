import Image from "next/image";

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
  image?: string;
}

export function WikiArticleHeader({ title, universe, category, image }: WikiArticleHeaderProps) {
  return (
    <header className="relative h-[400px] md:h-[550px] w-full overflow-hidden border-b border-white/10 group">
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-80 transition-transform duration-[3s] group-hover:scale-110"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#00060d] via-[#00060d]/40 to-transparent" />
      
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 space-y-6">
        <div className="flex flex-wrap gap-3">
          <span className="text-[9px] md:text-[10px] font-bold px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full uppercase tracking-wider backdrop-blur-md">
            {universe}
          </span>
          {category && (
            <span className="text-[9px] md:text-[10px] font-bold px-4 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-full uppercase tracking-wider backdrop-blur-md">
              {category}
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-8xl font-bold text-white italic tracking-tight leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] uppercase">
          {title}
        </h1>
      </div>
    </header>
  );
}