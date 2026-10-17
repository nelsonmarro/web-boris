import { getAllArticles } from '@/utils/mdx';
import { pickFeatured } from '@/features/monsters/lib/featured';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroSection } from '@/features/marketing/sections/HeroSection';
import { LoreStatsSection } from '@/features/marketing/sections/LoreStatsSection';
import { UniversePreviewSection } from '@/features/marketing/sections/UniversePreviewSection';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { AboutBorisSection } from '@/features/marketing/sections/AboutBorisSection';
import { ContactSection } from '@/features/marketing/sections/ContactSection';

/** La criatura del hero rota por semana ISO sin necesidad de rebuild. */
export const revalidate = 86400;

export default async function Home() {
  const featured = pickFeatured(await getAllArticles());

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HeroSection featured={featured} />
        <LoreStatsSection />
        <UniversePreviewSection />
        <FeaturedCharactersSection />
        <FeaturedVideosSection />
        <AboutBorisSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
