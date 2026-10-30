import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { FEATURED_CHARACTERS } from '../config/featured-characters';
import { LANDING_SECTION } from './landing-rhythm';

/**
 * Tres personajes para empezar a leer el archivo; el texto es de Boris (`FEATURED_CHARACTERS`), sin parafrasear.
 * Compacta (UX fase 1 §A.3): tarjetas 16:9. En móvil, una fila horizontal con desplazamiento por tarjeta (la siguiente
 * asoma por la derecha), así la sección cabe en una pantalla; desde md, tres columnas. La fila no necesita foco
 * propio: el teclado entra por los enlaces de las tarjetas y el navegador las desplaza a la vista.
 */
export async function FeaturedCharactersSection() {
  const articles = await getContentRepository().getArticles();
  const frontmatterBySlug = new Map(articles.map((a) => [a.slug, a.frontmatter]));

  return (
    <Section id="personajes" title="Personajes destacados" className={LANDING_SECTION}>
      <div className="-mx-6 flex snap-x snap-mandatory scroll-px-6 -my-2 gap-3 overflow-x-auto px-6 py-2 [scrollbar-width:none] md:m-0 md:grid md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
        {FEATURED_CHARACTERS.map((def) => {
          const fm = frontmatterBySlug.get(def.slug);
          return (
            <ContentCard
              key={def.slug}
              href={`/wiki/${def.slug}`}
              title={def.name}
              description={def.description}
              lines={3}
              aspect="video"
              image={fm?.image}
              imagePosition={fm?.imagePosition}
              category={fm?.category}
              className="w-[80%] shrink-0 snap-start md:w-auto"
              sizes="(min-width: 768px) 33vw, 80vw"
            />
          );
        })}
      </div>
    </Section>
  );
}
