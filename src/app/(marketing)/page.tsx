import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroBleed } from '@/features/marketing/sections/HeroBleed';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { CommunityStrip } from '@/features/marketing/sections/CommunityStrip';
import { AboutContactSection } from '@/features/marketing/sections/AboutContactSection';

/** Criatura, duelo de la semana y último vídeo cambian sin rebuild. */
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HeroBleed />
        <FeaturedCharactersSection />
        <FeaturedVideosSection />
        <CommunityStrip />
        <AboutContactSection />
      </main>
      <Footer />
    </div>
  );
}
