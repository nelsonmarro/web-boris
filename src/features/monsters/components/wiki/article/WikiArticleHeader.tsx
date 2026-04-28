import { WikiBreadcrumbs } from "./WikiBreadcrumbs";
import { WikiArticleActions } from "./WikiArticleActions";

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
}

export function WikiArticleHeader({ title, universe, category }: WikiArticleHeaderProps) {
  return (
    <header className="pt-10 pb-6 px-8 md:px-12 lg:px-16 border-b border-white/10 relative z-20 print:hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
        <WikiBreadcrumbs universe={universe} category={category} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
            {title}
          </h1>

          <WikiArticleActions title={title} />
        </div>
      </div>
    </header>
  );
}
