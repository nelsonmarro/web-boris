import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { BrandCapsule } from '../components/hero/BrandCapsule';
import { SearchBar } from '../components/hero/SearchBar';
import { HeroVisual } from '../components/hero/HeroVisual';

export function HeroSection({ featured }: { featured: WikiArticleSummary | null }) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-transparent pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-28 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[5%] top-[5%] h-[700px] w-[700px] rounded-full bg-primary/5 opacity-30 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[5%] h-[800px] w-[800px] rounded-full bg-blue-600/5 opacity-20 blur-[180px] mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8 text-left">
          <BrandCapsule>Universos de BorisaoBlois</BrandCapsule>

          <h1 className="text-[1.75rem] font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-[400px]:text-3xl sm:text-4xl md:text-5xl xl:text-6xl">
            EXPLORA LA INMENSIDAD{' '}
            <span className="block bg-gradient-to-r from-primary to-orange-400 bg-clip-text italic text-transparent drop-shadow-[0_8px_20px_rgba(255,115,0,0.4)]">
              DE MIS UNIVERSOS
            </span>
          </h1>

          <p className="max-w-lg text-base font-medium leading-relaxed text-white/70 drop-shadow-md md:text-lg">
            Y sus historias: colosos abisales, capitanes del siglo XVIII y una Segunda Guerra Mundial
            interrumpida por un enemigo salido de la nada. Todo el lore oficial de BorisaoBlois en un
            solo archivo.
          </p>

          <SearchBar />

          <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center">
            <Link href="/wiki" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 w-full rounded-full border-t border-white/20 bg-primary px-10 text-[11px] font-bold uppercase italic tracking-wider shadow-[0_15px_30px_rgba(255,115,0,0.4)] transition-all hover:scale-[1.03]">
                Acceder a la wiki
              </Button>
            </Link>
            <Link href="#universos" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="glass-liquid h-14 w-full rounded-full border-white/20 px-10 text-[11px] font-bold uppercase italic tracking-wider text-white shadow-[0_15px_25px_rgba(0,0,0,0.3)] transition-all hover:border-white/40 hover:bg-white/10">
                Ver universos
              </Button>
            </Link>
          </div>
        </div>

        <HeroVisual
          imageSrc="/assets/Universo_Colosos/The_Bloop/The_Bloop_cuerpo_completo.webp"
          alt="Primer plano de la cabeza de The Bloop Ojo Solo"
          badge={
            featured
              ? {
                  href: `/wiki/${featured.slug}` as Route,
                  label: 'Expediente de la semana',
                  title: featured.frontmatter.title,
                  thumb: featured.frontmatter.image,
                }
              : null
          }
        />
      </div>
    </section>
  );
}
