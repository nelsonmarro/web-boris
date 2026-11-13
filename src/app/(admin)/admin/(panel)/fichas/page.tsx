import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { listArticles } from '@/features/admin/server/articles';
import { DraftBadge, StatusBadge } from '@/features/admin/components/StatusBadge';
import { FIELD } from '@/features/admin/components/editor/field-styles';

export const metadata: Metadata = { title: 'Fichas' };

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = '' } = await searchParams;
  const query = normalize(typeof q === 'string' ? q.slice(0, 100) : '');
  const all = await listArticles();
  const articles = query ? all.filter((article) => normalize(`${article.title} ${article.slug} ${article.universe}`).includes(query)) : all;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Fichas de la wiki</h1>
        <Button asChild size="sm">
          <Link href="/admin/fichas/nueva">Nueva ficha</Link>
        </Button>
      </div>
      <form role="search" className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm font-bold text-white">Buscar</span>
          <input name="q" defaultValue={q} className={FIELD} placeholder="Nombre, dirección o universo" />
        </label>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>
      <p className="text-sm text-white/70" aria-live="polite">
        {articles.length} de {all.length} fichas
      </p>
      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#061a2e]">
        {articles.map((article) => (
          <li key={article.slug} className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-white/5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/fichas/${article.slug}` as Route}
                className="font-bold text-white after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {article.title}
              </Link>
              <p className="text-sm text-white/70">
                {article.universe}
                {article.category ? ` · ${article.category}` : ''}
                {article.sealed ? ' · Sellada' : ''} · /wiki/{article.slug}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={article.status} />
              {article.hasDraft && article.status !== 'nueva' ? <DraftBadge /> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
