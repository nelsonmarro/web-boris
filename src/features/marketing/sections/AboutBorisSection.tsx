import Image from 'next/image';
import Link from 'next/link';
import { Mail, Sparkles } from 'lucide-react';
import { YoutubeIcon } from '@/features/marketing/components/icons/YoutubeIcon';
import {
  SOCIAL_LINKS,
  YOUTUBE_HANDLE,
  CONTACT_EMAIL,
} from '@/features/marketing/config/social';
import { UNIVERSES } from '@/features/marketing/config/universes';
import { ProximamenteChip } from '@/features/monsters/components/wiki/mdx/Proximamente';

const listFormat = new Intl.ListFormat('es', {
  style: 'long',
  type: 'conjunction',
});

const published = UNIVERSES.filter((u) => !u.comingSoon);
const upcoming = UNIVERSES.filter((u) => u.comingSoon);

const chipBase =
  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider';

export function AboutBorisSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="crystal-surface rounded-3xl overflow-hidden relative">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Brand mark column */}
            <div className="w-full lg:w-1/2 relative min-h-[260px] sm:min-h-[360px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)]">
              <Image
                src="/assets/Branding/Logo2.webp"
                alt="Logo de BorisaoBlois"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-10 sm:p-16"
              />
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center space-y-8 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 text-primary">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  <span className="eyebrow">El autor</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-bold text-white italic tracking-tight uppercase leading-none break-words">
                  Borisao<span className="text-primary">Blois</span>
                </h2>
                <p className="text-xl text-white/60 font-medium leading-relaxed">
                  Autor de los universos narrativos{' '}
                  {listFormat.format(published.map((u) => u.title))}.
                  {upcoming.length > 0 && (
                    <>
                      {' '}
                      {listFormat.format(upcoming.map((u) => u.title))}{' '}
                      {upcoming.length === 1 ? 'está' : 'están'} en preparación.
                    </>
                  )}
                </p>

                <ul className="flex flex-wrap gap-2" aria-label="Universos">
                  {UNIVERSES.map((u) => (
                    <li key={u.id}>
                      {u.universeKey ? (
                        <Link
                          href={`/wiki?universe=${encodeURIComponent(u.universeKey)}#explorar`}
                          className={`${chipBase} ${u.comingSoon ? 'border-dashed' : ''} border-white/10 bg-[#00122E] text-white transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                        >
                          {u.title}
                          {u.comingSoon && <ProximamenteChip />}
                        </Link>
                      ) : (
                        <span
                          className={`${chipBase} border-dashed border-white/10 bg-[#00122E] text-white/60`}
                        >
                          {u.title}
                          <ProximamenteChip />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-[#00122E] px-4 py-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-white/60">
                    Biografía de Boris
                  </span>
                  <ProximamenteChip />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 min-w-0">
                  <p className="eyebrow text-white/60">Canal</p>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary block break-words font-display text-2xl font-bold uppercase italic tracking-tight text-white transition-colors hover:text-primary sm:text-3xl md:text-4xl"
                  >
                    {YOUTUBE_HANDLE}
                  </a>
                </div>
                <div className="space-y-2 min-w-0">
                  <p className="eyebrow text-white/60">Universos</p>
                  <p className="font-display text-2xl font-bold uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
                    {published.length}
                  </p>
                  {upcoming.length > 0 && (
                    <p className="text-sm text-white/60">
                      {upcoming.length} en preparación
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-red-600/20 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <YoutubeIcon className="h-5 w-5" />
                  Ver canal en YouTube
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Mail className="h-5 w-5" />
                  Escribir a Boris
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
