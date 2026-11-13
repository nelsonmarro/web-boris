/** Esqueleto de una ficha nueva según su tipo (spec «fichas estándar» §2). Puro. */
import type { ArticleData } from '../../../core/content/overlay.ts';

/** Apartados del estándar por categoría. Las que no están aquí (índices) empiezan vacías. */
export const SECTIONS_BY_CATEGORY: Record<string, readonly string[]> = {
  Coloso: ['Características', 'Comportamiento', 'Alimentación'],
  Titán: ['Características', 'Comportamiento', 'Alimentación'],
  Animal: ['Características', 'Comportamiento', 'Alimentación'],
  Especie: ['Características', 'Comportamiento', 'Alimentación'],
  Humano: ['Biografía', 'Trayectoria', 'Relaciones'],
  Organización: ['Origen', 'Financiación y recursos', 'Miembros'],
  Vehículo: ['Características', 'Registro operativo'],
  Historia: ['Sinopsis', 'Acontecimientos'],
  Entidad: ['Sinopsis', 'Acontecimientos'],
  Libro: ['Sinopsis', 'Acontecimientos'],
};

/** Categorías que se pueden elegir al crear o editar una ficha. */
export const ARTICLE_CATEGORIES: readonly string[] = [...Object.keys(SECTIONS_BY_CATEGORY), 'Directorio', 'Categoría'];

/**
 * Ficha nueva: sellada (`status: proximamente`) hasta que Boris la complete, para que no se publique a medias por
 * error, y con un apartado `<Proximamente />` por cada sección del estándar.
 */
export function newArticleData(input: { title: string; universe: string; category: string }): ArticleData {
  const sections = SECTIONS_BY_CATEGORY[input.category] ?? [];
  return {
    frontmatter: { title: input.title, universe: input.universe, category: input.category, status: 'proximamente' },
    content: sections.map((title) => `## ${title}\n\n<Proximamente />\n`).join('\n'),
  };
}
