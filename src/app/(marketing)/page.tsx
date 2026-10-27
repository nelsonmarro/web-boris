import type { Metadata } from 'next';
import { pageMetadata, SITE_NAME } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroAbisal } from '@/features/marketing/sections/HeroAbisal';
import { UniversesSection } from '@/features/marketing/sections/UniversesSection';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { CommunityStrip } from '@/features/marketing/sections/CommunityStrip';
import { AboutContactSection } from '@/features/marketing/sections/AboutContactSection';

// Sin `revalidate`: la landing es dinámica porque el hero sortea un expediente en cada visita (`connection()` en
// `getHeroCreature`). Los artículos se leen por petición y el RSS de vídeos sigue en la caché de `fetch` (1 h).

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
        <FeaturedVideosSection />
        <CommunityStrip />
        <AboutContactSection />
      </main>
      <Footer />
    </div>
  );
}
