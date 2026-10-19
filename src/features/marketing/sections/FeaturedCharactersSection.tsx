import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { FEATURED_CHARACTERS } from '../config/featured-characters';

/** Tres personajes para empezar a leer el archivo; el texto es de Boris (`FEATURED_CHARACTERS`), sin parafrasear. */
export async function FeaturedCharactersSection() {
  const articles = await getContentRepository().getArticles();
  const frontmatterBySlug = new Map(articles.map((a) => [a.slug, a.frontmatter]));

  return (
    <Section id="personajes" title="Personajes destacados" className="scroll-mt-24">
      <div className="grid gap-4 md:grid-cols-3">
        {FEATURED_CHARACTERS.map((def) => {
          const fm = frontmatterBySlug.get(def.slug);
          return (
            <ContentCard
              key={def.slug}
              href={`/wiki/${def.slug}`}
              title={def.name}
              description={def.description}
              lines={3}
              aspect="portrait"
              image={fm?.image}
              imagePosition={fm?.imagePosition}
              category={fm?.category}
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          );
        })}
      </div>
    </Section>
  );
}
