import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import type { NewsEntry } from '@/core/content';
import { Proximamente } from '@/features/monsters/components/wiki/mdx/Proximamente';
import { CrystalTile } from '@/components/crystal';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function NewsTile({ news, className }: { news: NewsEntry[]; className?: string }) {
  return (
    <CrystalTile eyebrow="Novedades del lore" title="Lo último" icon={Newspaper} className={className}>
      {news.length === 0 ? (
        <Proximamente titulo="Novedades en preparación" />
      ) : (
        <ul className="divide-y divide-white/10">
          {news.map((n) => {
            const external = n.enlace.startsWith('https://');
            return (
              <li key={n.id} className="py-4 first:pt-0 last:pb-0">
                <time dateTime={n.fecha} className="eyebrow text-white/60">
                  {dateFormat.format(new Date(`${n.fecha}T00:00:00Z`))}
                </time>
                <Link
                  href={n.enlace as Route}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mt-1 flex items-start gap-2 rounded-md font-bold text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>{n.titulo}</span>
                  {external && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                  {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
                </Link>
                <p className="mt-1 text-[15px] leading-relaxed text-white/70">{n.resumen}</p>
              </li>
            );
          })}
        </ul>
      )}
    </CrystalTile>
  );
}
