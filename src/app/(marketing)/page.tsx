import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroSection } from '@/features/marketing/sections/HeroSection';
import { LoreStatsSection } from '@/features/marketing/sections/LoreStatsSection';
import { UniversePreviewSection } from '@/features/marketing/sections/UniversePreviewSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { AboutBorisSection } from '@/features/marketing/sections/AboutBorisSection';
import { ContactSection } from '@/features/marketing/sections/ContactSection';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HeroSection />
        <LoreStatsSection />
        <UniversePreviewSection />
        <FeaturedVideosSection />
        <AboutBorisSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
