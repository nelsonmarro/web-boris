import { articleBadges, type BadgeTone, type FilterableArticle } from '../lib/article-filters';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-white/20 text-white/80',
  edited: 'border-emerald-400/40 text-emerald-200',
  draft: 'border-amber-400/40 text-amber-200',
  new: 'border-sky-400/40 text-sky-200',
  removed: 'border-red-400/40 text-red-200',
  sealed: 'border-white/20 text-white/70',
};

/** Las etiquetas de estado de una ficha («Sin cambios», «Editada», «Borrador pendiente»…). */
export function ArticleBadges({ article }: { article: FilterableArticle }) {
  return (
    <span className="flex flex-wrap gap-2">
      {articleBadges(article).map(({ text, tone }) => (
        <span key={text} className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
          {text}
        </span>
      ))}
    </span>
  );
}
