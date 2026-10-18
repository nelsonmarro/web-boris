import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HomeMosaic } from '@/features/marketing/sections/HomeMosaic';
import { UniversePreviewSection } from '@/features/marketing/sections/UniversePreviewSection';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { AboutBorisSection } from '@/features/marketing/sections/AboutBorisSection';
import { ContactSection } from '@/features/marketing/sections/ContactSection';

/** Criatura, duelo de la semana y último vídeo cambian sin rebuild. */
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HomeMosaic />
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
