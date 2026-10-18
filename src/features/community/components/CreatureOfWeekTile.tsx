import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { cn } from '@/utils/cn';
import { CrystalTile } from '@/components/crystal';

export function CreatureOfWeekTile({ creature, className }: { creature: WikiArticleSummary | null; className?: string }) {
  if (!creature) return null;
  const { title, image, imagePosition, category, universe, description, stats } = creature.frontmatter;
  const threat = getThreatLevel(stats?.hostility);
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;

  return (
    <CrystalTile eyebrow="Criatura de la semana" title={title} icon={Sparkles} className={className}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E] lg:aspect-auto lg:min-h-[340px] lg:flex-1">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} />
        )}
        {threat && (
          <span
            className={cn(
              'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.15em] backdrop-blur-md',
              THREAT_TONE_CLASSES[threat.tone].badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} aria-hidden />
            Amenaza {threat.label}
          </span>
        )}
      </div>
      <p className="eyebrow mt-4 text-white/60">
        {universe}
        {category ? ` · ${category}` : ''}
      </p>
      {description && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-white/70">{description}</p>}
      <Link
        href={`/wiki/${creature.slug}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-[#00122E] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Ver ficha
      </Link>
    </CrystalTile>
  );
}
