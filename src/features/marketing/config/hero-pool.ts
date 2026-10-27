/** Un expediente que puede abrir la landing, con su toma y su encuadre propios para el hero. */
export interface HeroPoolEntry {
  slug: string;
  /** Toma propia para el hero (ruta en public/). Si falta, se usa la portada de la ficha. */
  image?: string;
  /** `object-position` de esa toma. Si falta, el `imagePosition` de la ficha. */
  imagePosition?: string;
}

/**
 * Expedientes que pueden abrir la landing (spec 2026-10-27 §3). Solo monstruos, cada uno con una toma clara: las
 * portadas de las fichas son escenas de profundidad oscuras que desaparecen sobre el fondo #00122E. Orden sin
 * importancia.
 */
export const HERO_POOL: readonly HeroPoolEntry[] = [
  {
    slug: 'the-bloop',
    image: '/assets/Universo_Colosos/The_Bloop/The_Bloop_emergiendo_helicopteros.webp',
    imagePosition: '50% 40%',
  },
  {
    slug: 'el-gran-maja',
    image: '/assets/Universo_Colosos/El_Gran_Maja/El_Gran_Maja_superficie_amanecer.webp',
    imagePosition: '60% 50%',
  },
  {
    slug: 'bogbo',
    image: '/assets/Universo_Colosos/Bogbo/Bogbo_emergiendo_frontal.webp',
    imagePosition: '55% 35%',
  },
  {
    slug: 'vlad-julia',
    image: '/assets/Universo_Colosos/Vlad_Julia/Vlad_Julia_frontal.webp',
    imagePosition: '50% 50%',
  },
];
