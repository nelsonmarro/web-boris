import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiArticleActions } from './WikiArticleActions';

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
}

export function WikiArticleHeader({ title, universe, category }: WikiArticleHeaderProps) {
  return (
    <header className="relative z-20 border-b border-white/10 print:hidden">
      <div className="wiki-container flex flex-col gap-5 pb-6 pt-8 lg:pt-10">
        <WikiBreadcrumbs universe={universe} category={category} />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h1 className="page-title">{title}</h1>
          <WikiArticleActions title={title} />
        </div>
      </div>
    </header>
  );
}
