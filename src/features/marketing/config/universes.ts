/**
 * Universos narrativos de Boris tal como los describe él.
 * Fuentes: "Frases y descripciones" (Colosos, Capitán de Galeón y La Hecatombe del Lapeón; su
 * «Descripción de cada universo» manda sobre el PDF) y "Requerimientos Pagina" (Ellos Llegaron,
 * que el documento no describe). Textos copiados sin parafrasear.
 */
export interface UniverseDef {
  /** Slug estable para keys y anclas. */
  id: string;
  /** Nombre visible. */
  title: string;
  /** Valor EXACTO de `universe:` en el frontmatter; undefined si aún no hay artículos. Habilita el enlace "Explorar lore" a la wiki, también en universos `comingSoon`. */
  universeKey?: string;
  /** Eyebrow corto con la época o el escenario. */
  era: string;
  /** Sinopsis de Boris. */
  description: string;
  /** Portada; undefined mientras no haya arte. */
  image?: string;
  /** `object-position` CSS de la portada (punto focal del recorte). */
  imagePosition?: string;
  /** Universo anunciado sin arte todavía: la portada muestra "Próximamente" y fondo sin imagen. Si además tiene `universeKey` (artículo marcado `status: proximamente`), enlaza a la wiki; si no, la tarjeta no enlaza a nada. */
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
      'Una historia ambientada en la era contemporánea. Un mundo cuyos océanos albergan formas de vida espectaculares, gigantescas, monstruosas. El papel de las bestias que merodean por cada rincón oculto del planeta define el rumbo de la historia de la vida en su más amplio concepto y también el destino de la humanidad. ¿Puede el ser humano adaptarse a animales con un peso tan grande en la cámara de la existencia? ¿Pueden vivir de la forma en la que se han acostumbrado? Podrán ver las batallas colosales más impresionantes, o protagonizar sus propios enfrentamientos con tal de defender lo que les interesa. Sea como sea, la presencia de los Colosos no puede ni podrá ser ignorada.',
  },
  {
    id: 'capitan-de-galeon',
    title: 'Capitán de Galeón',
    universeKey: 'Capitán de Galeón',
    era: 'Siglo XVIII',
    image: '/assets/Universo_Capitán_de_Galeón/Borisao/Borisao_2_F_(1).webp',
    imagePosition: '50% 45%',
    description:
      'Ambientado en la era náutica del siglo XVIII, un capitán inglés goza de un prestigio y fama que lo llenan de orgullo. Pero un súbito fracaso amenaza todo cuanto ha logrado, y por todos los medios busca mantener la buena opinión de la Corona y la Marina. Arrastrado por esta empresa, no repara en ir tan lejos como puede, retando sus propios principios, descubriendo eventos y un ser que va más allá de la comprensión humana con tal de cumplir con su objetivo.',
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
    universeKey: 'La Hecatombe del Lapeón',
    era: 'Vía Láctea',
    comingSoon: true,
    description:
      'Dos civilizaciones en la Vía Láctea se encuentran en su apogeo y máxima armonía. Pero, a la expectativa y ajenos, los humanos y otras especies de la galaxia contemplan con temor una tensión creciente entre estas enormes potencias: los Lapeones y los Cyon. La cuerda entre ellas se estira cada vez más y, a pesar de todos los esfuerzos políticos de cada bando, la guerra intergaláctica más grande jamás vista parece inevitable y un horror del cual nadie podrá escapar, ni siquiera aquellos que deciden mantenerse al margen. Lo que comenzó por un asalto a un carguero Lapeón, terminó en un planeta consumido por la mitad.',
  },
];
