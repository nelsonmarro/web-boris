import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { WikiFrontmatter } from '@/core/types/wiki';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';

interface WikiInfoboxCompactProps {
  frontmatter: WikiFrontmatter;
  /** Infobox completa (se muestra dentro de "Ficha completa"). */
  children: React.ReactNode;
}

/** Ficha resumida para < md: lo esencial arriba, la infobox completa plegada. */
export function WikiInfoboxCompact({ frontmatter, children }: WikiInfoboxCompactProps) {
  const { title, image, category, universe, stats } = frontmatter;
  const threat = getThreatLevel(stats?.hostility);
  const facts: Array<{ label: string; value: React.ReactNode }> = [];
  if (stats?.length !== undefined) facts.push({ label: 'Longitud', value: `${stats.length.toLocaleString('es-ES')} m` });
  if (threat) {
    facts.push({
      label: 'Amenaza',
      value: (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.12em]', THREAT_TONE_CLASSES[threat.tone].badge)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
          {threat.label}
        </span>
      ),
    });
  }
  if (stats?.weight) facts.push({ label: 'Peso', value: stats.weight });
  if (stats?.biteType) facts.push({ label: 'Mordida', value: stats.biteType });

  return (
    <section aria-label={`Ficha de ${title}`} className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-2xl">
      <div className="flex items-center gap-4 p-4">
        {image ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <Image src={image} alt="" fill sizes="96px" className="object-cover" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="eyebrow text-primary">{universe}{category ? ` · ${category}` : ''}</p>
          <p className="mt-1 truncate text-lg font-black uppercase italic tracking-tight text-white">{title}</p>
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
          {facts.slice(0, 4).map((f) => (
            <div key={f.label} className="bg-[#061a2e] px-4 py-3">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">{f.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-white/85">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <details className="group border-t border-white/10">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary marker:hidden [&::-webkit-details-marker]:hidden">
          Ficha completa
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-white/5 [&>aside]:mb-0 [&>aside]:rounded-none [&>aside]:border-0 [&>aside]:shadow-none">
          {children}
        </div>
      </details>
    </section>
  );
}
