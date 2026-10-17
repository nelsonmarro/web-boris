import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Swords } from 'lucide-react';
import type { WikiArticle } from '@/core/types/wiki';
import { getAllArticles, getArticleBySlug } from '@/utils/mdx';
import { hasStats, scaleTen } from '@/features/monsters/lib/stats';
import { computeMatchup, scoreFighter, type Fighter } from '@/features/monsters/lib/arena';
import { StatRow } from '@/features/monsters/components/wiki/StatRow';
import { cn } from '@/utils/cn';
import { getLoreStats } from '../actions/get-lore-stats';

/** Enfrentamiento canónico del lore: la batalla del Atlántico. */
const CANON_PAIR = ['el-gran-maja', 'the-bloop'] as const;

const toFighter = (article: WikiArticle | null): Fighter | null =>
  article && hasStats(article.frontmatter)
    ? { slug: article.slug, frontmatter: article.frontmatter }
    : null;

/** Pareja canónica; si alguna ficha falta, los dos combatientes de mayor puntaje del archivo. */
async function pickFighters(): Promise<[Fighter, Fighter] | null> {
  const [a, b] = (await Promise.all(CANON_PAIR.map((slug) => getArticleBySlug(slug)))).map(toFighter);
  if (a && b) return [a, b];

  const ranked = (await getAllArticles())
    .map(toFighter)
    .filter((f): f is Fighter => f !== null)
    .sort((x, y) => scoreFighter(y.frontmatter.stats) - scoreFighter(x.frontmatter.stats));
  return ranked.length >= 2 ? [ranked[0], ranked[1]] : null;
}

function FighterColumn({ fighter, side }: { fighter: Fighter; side: 'A' | 'B' }) {
  const { title, universe, image, stats } = fighter.frontmatter;
  const isA = side === 'A';
  const tone = isA ? 'primary' : 'cyan';

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border',
          isA ? 'border-primary/40' : 'border-cyan-400/40',
        )}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_45%,#00122E_100%)]" />
        )}
      </div>
      <span className={cn('eyebrow mt-5', isA ? 'text-primary' : 'text-cyan-300')}>Universo {universe}</span>
      <h3 className="mt-1 text-2xl font-black uppercase italic tracking-tight text-white">{title}</h3>
      <div className="mt-3">
        {stats.power !== undefined && (
          <StatRow label="Poder" value={stats.power} display={`${stats.power}`} tone={tone} />
        )}
        {stats.defense !== undefined && (
          <StatRow label="Defensa" value={stats.defense} display={`${stats.defense}`} tone={tone} />
        )}
        {stats.hostility !== undefined && (
          <StatRow label="Hostilidad" value={scaleTen(stats.hostility)} display={`${stats.hostility}/10`} tone={tone} />
        )}
      </div>
    </div>
  );
}

export async function ArenaTeaserSection() {
  const [fighters, lore] = await Promise.all([pickFighters(), getLoreStats()]);
  if (!fighters) return null;

  const [a, b] = fighters;
  const matchup = computeMatchup(a.frontmatter.stats, b.frontmatter.stats);
  const pctA = Math.round(matchup.probA * 100);
  const pctB = 100 - pctA;
  const favorite = matchup.probA >= 0.5 ? a : b;

  return (
    <section id="arena" className="relative scroll-mt-24 overflow-hidden py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 eyebrow text-primary">
            <Swords className="h-3.5 w-3.5" />
            Versus Arena
          </div>
          <h2 className="section-title md:text-4xl lg:text-5xl">
            Enfrenta a los <span className="text-primary">colosos</span>
          </h2>
          <p className="text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Simulación determinista a partir de las fichas biométricas del archivo.
          </p>
        </div>

        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#061a2e] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:p-8">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <FighterColumn fighter={a} side="A" />

            <div className="flex w-full flex-col items-center gap-4 md:w-44 lg:w-56">
              <span className="font-mono text-4xl font-bold tracking-widest text-primary">VS</span>
              <div className="w-full space-y-2">
                <div
                  role="img"
                  aria-label={`Probabilidad de victoria: ${a.frontmatter.title} ${pctA} %, ${b.frontmatter.title} ${pctB} %`}
                  className="flex h-2 w-full overflow-hidden rounded-full bg-white/10"
                >
                  <span className="h-full bg-primary" style={{ width: `${matchup.probA * 100}%` }} />
                  <span className="h-full bg-cyan-400" style={{ width: `${(1 - matchup.probA) * 100}%` }} />
                </div>
                <div className="flex justify-between font-mono text-[12px] font-bold tabular-nums" aria-hidden="true">
                  <span className="text-primary">{pctA}%</span>
                  <span className="text-cyan-300">{pctB}%</span>
                </div>
              </div>
            </div>

            <FighterColumn fighter={b} side="B" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-5 border-t border-white/10 pt-8 text-center">
            <p className="text-base font-medium leading-relaxed text-white/80">
              <strong className="font-bold text-white">{favorite.frontmatter.title}</strong> parte como favorito ·
              factor decisivo: {matchup.decisiveAxis.label}
            </p>
            <Link
              href="/wiki/arena"
              className="group/cta inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-[11px] font-bold uppercase tracking-wider text-[#00122E] shadow-[0_15px_30px_rgba(255,115,0,0.3)] transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Abrir la Arena
              <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[12px] leading-relaxed text-white/60">
          {lore.loreEntries} expedientes · {lore.creaturesWithStats} fichas biométricas · {lore.visualFiles} archivos
          visuales · {lore.universes} universos
        </p>
      </div>
    </section>
  );
}
