import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { UNIVERSES } from '../config/universes';
import { countByUniverse, expedientesLabel } from '../lib/universe-counts';
import { LANDING_SECTION } from './landing-rhythm';

/**
 * Puerta de entrada al archivo por universo (spec 2026-10-27 §6): sinopsis canónica de Boris y cuántos expedientes
 * abiertos tiene cada uno (sin índices ni sellados). La navbar y el footer enlazan aquí (`/#universos`).
 */
export async function UniversesSection() {
  const articles = await getContentRepository().getArticles();
  const countOf = countByUniverse(articles);

  return (
    <Section id="universos" title="Explora los universos" className={LANDING_SECTION}>
      <p className="-mt-4 mb-8 max-w-2xl text-white/70">Cada universo tiene sus propias reglas, criaturas y misterios.</p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {UNIVERSES.map((u) => (
          <ContentCard
            key={u.id}
            href={u.universeKey ? `/wiki?universe=${encodeURIComponent(u.universeKey)}#catalogo` : undefined}
            title={u.title}
            meta={u.comingSoon || !u.universeKey ? u.era : `${u.era} · ${expedientesLabel(countOf(u.universeKey))}`}
            description={u.description}
            lines={3}
            image={u.image}
            imagePosition={u.imagePosition}
            pending={u.comingSoon}
            aspect="video"
            headingLevel={3}
            // Sin `eager`: desde UX fase 1 los universos van tras «Vídeos», lejos de la primera pantalla.
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        ))}
      </div>
    </Section>
  );
}
