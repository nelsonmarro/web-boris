/**
 * Universos narrativos de Boris tal como los describe él.
 * Fuentes: "Requerimientos Pagina" (Colosos, Capitán de Galeón, Ellos llegaron) y
 * "Frases y descripciones" (La Hecatombe del Lapeón). Textos copiados sin parafrasear.
 */
export interface UniverseDef {
  /** Slug estable para keys y anclas. */
  id: string;
  /** Nombre visible. */
  title: string;
  /** Valor EXACTO de `universe:` en el frontmatter; undefined si aún no hay artículos. */
  universeKey?: string;
  /** Eyebrow corto con la época o el escenario. */
  era: string;
  /** Sinopsis de Boris. */
  description: string;
  /** Portada; undefined mientras no haya arte. */
  image?: string;
  /** `object-position` CSS de la portada (punto focal del recorte). */
  imagePosition?: string;
  /** Universo anunciado sin arte ni artículos todavía. */
  comingSoon?: boolean;
}

export const UNIVERSES: readonly UniverseDef[] = [
  {
    id: 'colosos',
    title: 'Colosos',
    universeKey: 'Colosos',
    era: 'Era contemporánea',
    image: '/assets/Universo_Colosos/The_Bloop/The_Bloop_fauces.webp',
    imagePosition: '35% 30%',
    description:
      'Bestias colosales se muestran ante la humanidad. El contacto con los humanos remece el curso del ecosistema. Sus historias, sus acciones y su presencia afectan la vida como se conoce. Y una anguila monstruosa angustia al hombre. Siempre hay algo más detrás de un monstruo abisal, una historia, una mente, una conciencia y una consecuencia…',
  },
  {
    id: 'capitan-de-galeon',
    title: 'Capitán de Galeón',
    universeKey: 'Capitán de Galeón',
    era: 'Siglo XVIII',
    image: '/assets/Universo_Capitán_de_Galeón/Borisao/Borisao_2_F_(1).webp',
    imagePosition: '50% 45%',
    description:
      'La historia que comienza con un capitán inglés, mortificado por una tragedia, y obligado a mezclarse con un mundo ajeno a los humanos pero que, tarde o temprano, los involucrará de manera peligrosa. El cran de piel blanca y cola de escorpión espera y su palabra es casi inexpugnable. El mar albergará batallas entre grandes navíos, capitanes excéntricos y piratas; quién sabe si otros elementos enigmáticos también protagonicen los encuentros bélicos.',
  },
  {
    id: 'ellos-llegaron',
    title: 'Ellos Llegaron',
    universeKey: 'Ellos Llegaron',
    era: 'Años 40',
    image: '/assets/Universo_Ellos_llegaron/El_Angel/ellosllegaron1.1.webp',
    imagePosition: '50% 45%',
    description:
      'La Tierra de los años 40, sacudida por la Segunda Guerra Mundial, frena en seco sus eventos para encontrarse con un enemigo implacable y extraño, salido de la nada. El "Ángel" lo mira todo y tapa el cielo como un velo. No vino de arriba, ni tampoco de abajo, ¿de dónde llegó? ¿Acaso deben unirse enemigos acérrimos para pelear en conjunto contra este oponente impío?',
  },
  {
    id: 'hecatombe-del-lapeon',
    title: 'La Hecatombe del Lapeón',
    era: 'Vía Láctea',
    comingSoon: true,
    description:
      'Dos civilizaciones en la Vía Láctea se encuentran en su apogeo y máxima armonía. Pero, a la expectativa y ajenos, los humanos y otras especies de la galaxia contemplan con temor una tensión creciente entre estas enormes potencias: los Lapeones y los Cyon. La cuerda entre ellas se estira cada vez más y, a pesar de todos los esfuerzos políticos de cada bando, la guerra intergaláctica más grande jamás vista parece inevitable y un horror del cual nadie podrá escapar, ni siquiera aquellos que deciden mantenerse al margen. Lo que comenzó por un asalto a un carguero Lapeón, terminó en un planeta consumido por la mitad.',
  },
];
