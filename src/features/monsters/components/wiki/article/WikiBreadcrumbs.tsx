import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface WikiBreadcrumbsProps {
  universe: string;
  category?: string;
}

export function WikiBreadcrumbs({ universe, category }: WikiBreadcrumbsProps) {
  return (
    <nav aria-label="Ruta" className="eyebrow flex items-center gap-2 text-white/45">
      <Link href="/wiki" className="transition-colors hover:text-primary">
        Wiki
      </Link>
      <ChevronRight className="h-3 w-3" aria-hidden />
      <span className="text-white/60">{universe}</span>
      {category && (
        <>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-white/60">{category}</span>
        </>
      )}
    </nav>
  );
}
