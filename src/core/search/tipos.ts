/** Agrupación de categorías del frontmatter para la navegación por tipo (spec #55 §2). Puro. */
export type TipoId = 'criaturas' | 'personajes' | 'especies' | 'organizaciones' | 'vehiculos' | 'historia';

export const TIPOS: readonly { id: TipoId; label: string; categories: readonly string[] }[] = [
  { id: 'criaturas', label: 'Criaturas', categories: ['Coloso', 'Titán', 'Animal'] },
  { id: 'personajes', label: 'Personajes', categories: ['Humano', 'Entidad'] },
  { id: 'especies', label: 'Especies', categories: ['Especie'] },
  { id: 'organizaciones', label: 'Organizaciones', categories: ['Organización'] },
  { id: 'vehiculos', label: 'Vehículos', categories: ['Vehículo'] },
  { id: 'historia', label: 'Historia', categories: ['Historia', 'Libro'] },
];

export function tipoOf(category?: string): TipoId | null {
  if (!category) return null;
  return TIPOS.find((t) => t.categories.includes(category))?.id ?? null;
}

export function isTipoId(v: string): v is TipoId {
  return TIPOS.some((t) => t.id === v);
}
