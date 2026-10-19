import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight } from 'lucide-react';
import type { NewsEntry } from '@/core/content';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** "Novedades" como lista plana (spec #55 §6): fecha, título enlazado y una línea de resumen. Sin tarjetas. */
export function NewsList({ news }: { news: NewsEntry[] }) {
  if (news.length === 0) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Próximamente</p>
        <p className="mt-1 text-white/70">Novedades en preparación.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/10">
      {news.map((n) => {
        const external = n.enlace.startsWith('https://');
        return (
          <li key={n.id} className="py-4">
            <time dateTime={n.fecha} className="block text-[12px] text-white/55">
              {dateFormat.format(new Date(`${n.fecha}T00:00:00Z`))}
            </time>
            <Link
              href={n.enlace as Route}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="-my-1.5 flex min-h-11 items-center gap-2 rounded-md font-bold text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
            >
              <span>{n.titulo}</span>
              {external && <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />}
              {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
            </Link>
            <p className="line-clamp-1 text-sm text-white/70 md:line-clamp-2">{n.resumen}</p>
          </li>
        );
      })}
    </ul>
  );
}
