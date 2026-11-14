import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { listArticles } from '@/features/admin/server/articles';
import { ArticleBadges } from '@/features/admin/components/StatusBadge';
import { FIELD } from '@/features/admin/components/editor/field-styles';
import { searchArticles } from '@/features/admin/lib/panel-search';
import { countByState, filterArticles, isStateFilter, STATE_FILTERS, type StateFilter } from '@/features/admin/lib/article-filters';
import { getContentRepository } from '@/core/content';
import { MAX_QUERY_LENGTH } from '@/core/search/search';

export const metadata: Metadata = { title: 'Fichas' };

interface Filters {
  q: string;
  estado: StateFilter;
  universo: string;
}

/** Dirección del listado con estos filtros (los vacíos no se escriben). */
function hrefFor(filters: Filters): Route {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.universo) params.set('universo', filters.universo);
  const query = params.toString();
  return (query ? `/admin/fichas?${query}` : '/admin/fichas') as Route;
}

function Chip({ href, active, children }: { href: Route; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${
        active ? 'border-primary bg-primary/15 text-white' : 'border-white/20 text-white/80 hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string; universo?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.slice(0, MAX_QUERY_LENGTH) : '';
  const estado: StateFilter = isStateFilter(params.estado) ? params.estado : '';
  const [all, published] = await Promise.all([listArticles(), getContentRepository().getArticles()]);
  const universes = [...new Set(all.map((article) => article.universe))].sort((a, b) => a.localeCompare(b, 'es'));
  const universo = typeof params.universo === 'string' && universes.includes(params.universo) ? params.universo : '';
  const filters: Filters = { q, estado, universo };

  // Misma búsqueda que la wiki: palabras en cualquier orden, apodos y erratas.
  const aliases = new Map(published.map((article) => [article.slug, article.frontmatter.aliases ?? []]));
  const found = searchArticles(
    all.map((article) => ({ ...article, aliases: aliases.get(article.slug) })),
    q,
  );
  const inUniverse = filterArticles(found, { universe: universo });
  const counts = countByState(inUniverse);
  const articles = filterArticles(inUniverse, { state: estado });
  const filtered = Boolean(q || estado || universo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Fichas de la wiki</h1>
        <Button asChild size="sm">
          <Link href="/admin/fichas/nueva">Nueva ficha</Link>
        </Button>
      </div>
      <form role="search" className="flex flex-wrap items-end gap-3">
        {estado ? <input type="hidden" name="estado" value={estado} /> : null}
        {universo ? <input type="hidden" name="universo" value={universo} /> : null}
        <label className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm font-bold text-white">Buscar</span>
          <input name="q" defaultValue={q} className={FIELD} maxLength={MAX_QUERY_LENGTH} placeholder="Nombre, apodo, dirección o universo" />
        </label>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

      <nav aria-label="Filtrar fichas" className="space-y-3">
        <ul className="flex flex-wrap gap-2" aria-label="Por estado">
          {STATE_FILTERS.map(({ value, label }) => (
            <li key={value || 'todas'}>
              <Chip href={hrefFor({ ...filters, estado: value })} active={estado === value}>
                {label}
                <span className="text-white/60">{counts[value]}</span>
              </Chip>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-2" aria-label="Por universo">
          <li>
            <Chip href={hrefFor({ ...filters, universo: '' })} active={!universo}>
              Todos los universos
            </Chip>
          </li>
          {universes.map((name) => (
            <li key={name}>
              <Chip href={hrefFor({ ...filters, universo: name })} active={universo === name}>
                {name}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <p className="flex flex-wrap items-center gap-3 text-sm text-white/70" aria-live="polite">
        {articles.length} de {all.length} fichas
        {filtered ? (
          <Link href="/admin/fichas" className="inline-flex min-h-10 items-center font-semibold text-white/80 underline underline-offset-4 hover:text-primary">
            Quitar filtros
          </Link>
        ) : null}
      </p>
      {articles.length ? (
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#061a2e]">
          {articles.map((article) => {
            const cover = coverOf(article.image);
            return (
              <li key={article.slug} className="relative flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-white/5 @lg:px-5">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
                  <img src={cover} alt="" loading="lazy" className="aspect-video w-20 shrink-0 rounded-md border border-white/10 object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex aspect-video w-20 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_60%,#00122E_100%)]">
                    <ImageIcon className="size-4 text-primary/70" />
                  </span>
                )}
                <div className="min-w-0 flex-1 basis-48">
                  <Link
                    href={`/admin/fichas/${article.slug}` as Route}
                    className="font-bold text-white after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {article.title}
                  </Link>
                  <p className="text-sm text-white/70">
                    {article.universe}
                    {article.category ? ` · ${article.category}` : ''}
                  </p>
                </div>
                <ArticleBadges article={article} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-[#061a2e] p-5 text-white/80">Ninguna ficha coincide con la búsqueda y los filtros.</p>
      )}
    </div>
  );
}
