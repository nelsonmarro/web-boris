import { FlipCard } from '../components/FlipCard';
import { UNIVERSES } from '../config/universes';
import { getAllArticles } from '@/utils/mdx';

export async function UniversePreviewSection() {
  const articles = await getAllArticles();
  const countByUniverse = new Map<string, number>();
  for (const article of articles) {
    const key = article.frontmatter.universe;
    countByUniverse.set(key, (countByUniverse.get(key) ?? 0) + 1);
  }

  return (
    <section id="universos" className="relative scroll-mt-24 overflow-hidden bg-transparent py-24">
      <div className="pointer-events-none absolute left-[-10%] top-[20%] z-0 h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[80px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-5%] z-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] mix-blend-screen" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl space-y-6 text-center">
          <h2 className="text-4xl font-bold uppercase italic tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:text-5xl">
            Explora los Universos
          </h2>
          <p className="text-lg font-medium leading-relaxed text-white/70 drop-shadow-md">
            Cada universo tiene sus propias reglas, criaturas y misterios. Toca o pasa el cursor sobre una
            tarjeta para leer su sinopsis y entra a su archivo.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {UNIVERSES.map((universe) => (
            <FlipCard
              key={universe.id}
              universe={universe}
              count={universe.universeKey ? (countByUniverse.get(universe.universeKey) ?? 0) : 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
