import { ARENA_ROUTE, ESCALA_ROUTE, RANDOM_ROUTE, REGISTRO_ROUTE, TAMANOS_ROUTE } from '@/core/search/wiki-routes';

/** Una herramienta del archivo en «Cómo usar el archivo» (/empieza-aqui, spec UX fase 2 §1): una línea y su enlace. */
export interface GuideItem {
  title: string;
  href: string;
  text: string;
  /** El aleatorio es un route handler que redirige: sin prefetch (CLAUDE.md). */
  prefetch?: false;
}

/** Copy de interfaz: describe qué hace cada página, no el lore. */
export const GUIDE: readonly GuideItem[] = [
  {
    title: 'Tu registro',
    href: REGISTRO_ROUTE,
    text: 'Cada expediente que abres queda marcado en este navegador. Completa el archivo y sube de rango, de Civil a Acceso total.',
  },
  {
    title: 'Expediente aleatorio',
    href: RANDOM_ROUTE,
    prefetch: false,
    text: 'Abre un expediente al azar entre los ya desclasificados.',
  },
  {
    title: 'Versus Arena',
    href: ARENA_ROUTE,
    text: 'Enfrenta a dos criaturas y compara sus registros biométricos.',
  },
  {
    title: 'Escala',
    href: ESCALA_ROUTE,
    text: 'Todas las criaturas de longitud conocida, a escala junto a una ballena azul, el Titanic o la torre Eiffel.',
  },
  {
    title: '¿Quién es más grande?',
    href: TAMANOS_ROUTE,
    text: 'Elige la más grande de cada pareja y bate tu racha.',
  },
  {
    title: 'Votación semanal',
    href: '/comunidad',
    text: 'Cada lunes, una votación nueva en Comunidad: un duelo entre dos criaturas o el expediente que debe desclasificarse.',
  },
];

/** Un término del glosario: solo definiciones canónicas que ya están en la wiki. */
export interface GlossaryItem {
  term: string;
  definition: string;
  /** Ficha de categoría de la que sale la definición. */
  href?: string;
  linkLabel?: string;
}

/**
 * Fuentes: `colosos.mdx` y `titanes.mdx` (sus primeras líneas, sin parafrasear los umbrales) y el sello de los
 * expedientes `status: proximamente` («Boris aún no ha desclasificado este expediente»). Nada que no esté ya en la wiki.
 */
export const GLOSSARY: readonly GlossaryItem[] = [
  {
    term: 'Coloso',
    definition:
      'La categoría de mayor tamaño entre los monstruos marinos: entidades cuyo peso supera las 20 mil toneladas y cuya longitud excede los 200 metros.',
    href: '/wiki/colosos',
    linkLabel: 'Ver los Colosos',
  },
  {
    term: 'Titán',
    definition:
      'Criatura de enorme tamaño que no alcanza los umbrales de la categoría Coloso (más de 200 metros de longitud y 20 mil toneladas de peso).',
    href: '/wiki/titanes',
    linkLabel: 'Ver los Titanes',
  },
  {
    term: 'Expediente sellado',
    definition:
      'Un expediente que Boris aún no ha desclasificado: aparece en el archivo, pero todavía sin su contenido. En las votaciones de Comunidad se puede pedir cuál se desclasifica primero.',
  },
];
