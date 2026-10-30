/**
 * Lo que el canon dice de los combatientes de la Versus Arena (spec «Arena más divertida» §3). Solo canon: cada cita es
 * **literal** de la ficha que se enlaza (sin el marcado de negrita del MDX) y el ancla es el `id` del apartado `##` que la
 * contiene (`slugify` del título). Lo comprueba `tests/arena/canon-battles.test.ts`, que lee los MDX.
 *
 * - `CANON_BATTLES`: enfrentamientos que ocurrieron. La Arena da siempre la victoria al ganador del canon, sin azar.
 * - `CANON_FACTS`: datos del archivo sobre la pareja (rivalidad, tamaño…) que no son un combate: se muestran como
 *   «Dato del archivo» y nunca fuerzan un resultado.
 *
 * Puro y sin imports: lo usan el cliente, la lógica de combate y los tests.
 */

export interface CanonSource {
  /** Ficha que contiene la cita. */
  slug: string;
  /** `id` del apartado `##` de la ficha donde está la cita. */
  anchor: string;
}

export interface CanonBattle {
  a: string;
  b: string;
  /** Slug del ganador según el canon (uno de `a` / `b`). */
  winner: string;
  /** Frase literal de la ficha. */
  quote: string;
  source: CanonSource;
}

/** Comodín de `CanonFact.b`: el dato vale para `a` contra cualquier rival. */
export const ANY_RIVAL = '*';

export interface CanonFact {
  a: string;
  /** Slug del rival, o `ANY_RIVAL`. Un dato de pareja manda sobre uno con comodín. */
  b: string;
  /** Frase literal de la ficha. */
  quote: string;
  source: CanonSource;
}

export const CANON_BATTLES: readonly CanonBattle[] = [
  {
    a: 'the-bloop',
    b: 'el-gran-maja',
    winner: 'el-gran-maja',
    quote: 'Aunque los humanos anhelaban la victoria del súper cetáceo, El Gran Majá le otorgó la derrota.',
    source: { slug: 'the-bloop', anchor: 'el-enigma-de-la-batalla-contra-el-gran-maja' },
  },
];

export const CANON_FACTS: readonly CanonFact[] = [
  {
    a: 'slowdown-criyonte',
    b: 'the-bloop',
    quote: 'Slowdown Criyonte nunca ha sido desafiado por un labodótipo macho, incluso si se hallan bajo ataque del mismo.',
    source: { slug: 'slowdown-criyonte', anchor: 'comportamiento-y-misterios' },
  },
  {
    a: 'bogbo',
    b: 'the-bloop',
    quote: 'Es uno de los ejemplares más grandes, con 351 metros de longitud, superado únicamente por Bogbo con 382 metros.',
    source: { slug: 'the-bloop', anchor: 'caracteristicas' },
  },
  {
    a: 'vlad-julia',
    b: 'el-gran-maja',
    quote:
      'Tampoco está claro qué relación tiene con las otras especies gigantes de los océanos, sobre todo con El Gran Majá, debido a que ambos habitan con mayor frecuencia el Atlántico.',
    source: { slug: 'vlad-julia', anchor: 'comportamiento' },
  },
  {
    a: 'vlad-julia',
    b: ANY_RIVAL,
    quote: 'Con seguridad, Vlad Julia carece de depredadores y es una figura que ningún otro monstruo desearía enfrentar.',
    source: { slug: 'vlad-julia', anchor: 'comportamiento' },
  },
];

/** Enlace a la cita en su ficha. */
export const canonHref = (source: CanonSource) => `/wiki/${source.slug}#${source.anchor}`;
