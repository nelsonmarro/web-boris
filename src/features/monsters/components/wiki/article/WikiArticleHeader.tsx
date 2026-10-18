import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiArticleActions } from './WikiArticleActions';
import { ProximamenteChip } from '../mdx/Proximamente';

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
  status?: 'proximamente';
}

export function WikiArticleHeader({ title, universe, category, status }: WikiArticleHeaderProps) {
  return (
    <header className="relative z-20 border-b border-white/10 print:hidden">
      <div className="wiki-container flex flex-col gap-5 pb-6 pt-8 lg:pt-10">
        <WikiBreadcrumbs universe={universe} category={category} />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-start gap-3">
            <h1 className="page-title">{title}</h1>
            {status === 'proximamente' && <ProximamenteChip />}
          </div>
          <WikiArticleActions title={title} />
        </div>
      </div>
    </header>
  );
}
