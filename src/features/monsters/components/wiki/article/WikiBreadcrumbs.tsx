import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface WikiBreadcrumbsProps {
  universe: string;
  category?: string;
}

export function WikiBreadcrumbs({ universe, category }: WikiBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
      <Link href="/wiki" className="hover:text-primary transition-colors">Explore</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="hover:text-primary transition-colors cursor-pointer">{universe}</span>
      {category && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-primary transition-colors cursor-pointer">{category}</span>
        </>
      )}
    </nav>
  );
}
