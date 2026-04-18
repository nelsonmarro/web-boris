import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/features/marketing/components/Hero';
import LoreStats from '@/features/marketing/components/LoreStats';
import Universes from '@/features/marketing/components/Universes';
import FeaturedVideos from '@/features/marketing/components/FeaturedVideos';
import AboutBoris from '@/features/marketing/components/AboutBoris';
import Contact from '@/features/marketing/components/Contact';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Stats (Histudy dynamic counter style) */}
        <LoreStats />

        {/* Section 3: Categories/Universes */}
        <Universes />

        {/* Section 4: Featured Videos */}
        <FeaturedVideos />

        {/* Section 5: Feature/About Creator (Histudy Instructor style) */}
        <AboutBoris />

        {/* Section 6: Contact */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
