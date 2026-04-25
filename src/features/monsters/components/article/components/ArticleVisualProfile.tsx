import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ArticleVisualProfileProps {
  image: string;
  title: string;
  universe: string;
  description: string;
}

export function ArticleVisualProfile({ image, title, universe, description }: ArticleVisualProfileProps) {
  return (
    <div className="w-full lg:w-[45%] relative h-[40vh] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40">
       <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-80"
          priority
       />
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
       
       <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 space-y-4">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
             {universe}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white italic uppercase tracking-tight leading-none drop-shadow-2xl">
             {title}
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-sm tracking-tight drop-shadow-md">
             {description}
          </p>
       </div>
    </div>
  );
}
