import type { ArticleStatus } from '../server/articles';

const LABELS: Record<ArticleStatus, { text: string; className: string }> = {
  archivo: { text: 'Original', className: 'border-white/20 text-white/80' },
  publicada: { text: 'Editada en el panel', className: 'border-emerald-400/40 text-emerald-200' },
  nueva: { text: 'Nueva, sin publicar', className: 'border-sky-400/40 text-sky-200' },
  borrador: { text: 'Borrador', className: 'border-amber-400/40 text-amber-200' },
  borrada: { text: 'Retirada de la web', className: 'border-red-400/40 text-red-200' },
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  const { text, className } = LABELS[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{text}</span>;
}

export function DraftBadge() {
  return <span className="inline-flex rounded-full border border-amber-400/40 px-2.5 py-0.5 text-xs font-semibold text-amber-200">Cambios sin publicar</span>;
}
