import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Ruler } from 'lucide-react';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { StatRow } from '@/features/monsters/components/wiki/StatRow';
import { getThreatLevel, THREAT_TONE_CLASSES, scaleTen } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';

export function FeaturedCreature({ article }: { article: WikiArticleSummary }) {
  const { slug, frontmatter: fm } = article;
  const stats = fm.stats;
  const threat = getThreatLevel(stats?.hostility);

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-10 w-1.5 rounded-full bg-primary shadow-[0_0_20px_rgba(255,115,0,0.8)] animate-pulse" />
        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">
          Criatura <span className="text-primary">destacada</span>
        </h2>
        <span className="ml-2 hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/50 sm:inline">
          Rotación semanal
        </span>
      </div>

      <article className="relative grid overflow-hidden rounded-[2.5rem] glass-liquid bg-[#061a2e] border-white/10 border-refractive shadow-[0_40px_80px_rgba(0,0,0,0.6)] lg:grid-cols-[1.2fr_1fr]">
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          {fm.image ? (
            <Image
              src={fm.image}
              alt={fm.title}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#00203F]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#061a2e]" />
          {fm.imageCaption && (
            <div className="absolute bottom-4 left-5 text-[10px] font-bold uppercase tracking-widest text-white/60 italic">
              {fm.imageCaption}
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col gap-6 p-8 md:p-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{fm.universe}</span>
              {fm.category && (
                <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                  {fm.category}
                </span>
              )}
              {threat && (
                <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em]', THREAT_TONE_CLASSES[threat.tone].badge)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
                  Amenaza {threat.label}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-black uppercase italic leading-none tracking-tight text-white md:text-5xl">
              {fm.title}
            </h3>
            {fm.description && (
              <p className="text-base leading-relaxed text-white/75">{fm.description}</p>
            )}
          </div>

          {stats && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              {stats.length !== undefined && (
                <div className="mb-2 flex items-center gap-2 font-mono text-xs text-white/70">
                  <Ruler className="h-3.5 w-3.5 text-primary" />
                  {stats.length.toLocaleString('es-ES')} m de longitud
                  {stats.weight && stats.weight !== 'No determinado' ? ` · ${stats.weight}` : ''}
                </div>
              )}
              {stats.power !== undefined && <StatRow label="Poder" value={stats.power} display={`${stats.power}`} />}
              {stats.defense !== undefined && <StatRow label="Defensa" value={stats.defense} display={`${stats.defense}`} />}
              {stats.hostility !== undefined && (
                <StatRow label="Hostilidad" value={scaleTen(stats.hostility)} display={`${stats.hostility}/10`} />
              )}
            </div>
          )}

          <Link
            href={`/wiki/${slug}`}
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(255,115,0,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,115,0,0.6)]"
          >
            Abrir expediente <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </section>
  );
}
