import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface WikiBreadcrumbsProps {
  universe: string;
  category?: string;
}

export function WikiBreadcrumbs({ universe, category }: WikiBreadcrumbsProps) {
  return (
    <nav aria-label="Ruta" className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1 text-white/60">
      <Link href="/wiki" className="transition-colors hover:text-primary">
        Wiki
      </Link>
      <ChevronRight className="h-3 w-3" aria-hidden />
      <span className="whitespace-nowrap text-white/60">{universe}</span>
      {category && (
        <>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="whitespace-nowrap text-white/60">{category}</span>
        </>
      )}
    </nav>
  );
}
