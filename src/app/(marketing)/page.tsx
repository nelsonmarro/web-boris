import { Suspense } from 'react';
import type { Metadata } from 'next';
import { pageMetadata, SITE_NAME } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroAbisal } from '@/features/marketing/sections/HeroAbisal';
import { UniversesSection } from '@/features/marketing/sections/UniversesSection';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection, FeaturedVideosSkeleton } from '@/features/marketing/sections/FeaturedVideosSection';
import { CommunityStrip } from '@/features/marketing/sections/CommunityStrip';
import { AboutContactSection } from '@/features/marketing/sections/AboutContactSection';

// Sin `revalidate`: la landing es dinámica porque el hero sortea un expediente en cada visita (`connection()` en
// `getHeroCreature`). Los artículos salen de `getAllArticles` (memoizado por proceso en producción) y el RSS de vídeos,
// de la caché de `fetch` (1 h). Con esa caché fría (cada despliegue o reinicio) el feed puede tardar unos 6 s: por eso
// `FeaturedVideosSection` va en `<Suspense>` y el hero y los universos se envían sin esperarlo.

export const metadata: Metadata = pageMetadata({
  title: SITE_NAME,
  description: 'Explora la inmensidad de mis universos y sus historias',
  path: '/',
});

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HeroAbisal />
        <UniversesSection />
        <FeaturedCharactersSection />
        <Suspense fallback={<FeaturedVideosSkeleton />}>
          <FeaturedVideosSection />
        </Suspense>
        <CommunityStrip />
        <AboutContactSection />
      </main>
      <Footer />
    </div>
  );
}
