export interface FeaturedCharacterDef {
  slug: 'the-bloop' | 'el-gran-maja' | 'phillip-forte';
  name: string;
  description: string;
}

/** Copys de Boris en "Requerimientos Pagina" → "Descripciones Personajes". No parafrasear. */
export const FEATURED_CHARACTERS: readonly FeaturedCharacterDef[] = [
  {
    slug: 'the-bloop',
    name: 'The Bloop Ojo Solo',
    description:
      'Súper cetáceo dentado, mamífero y de los ejemplares de labodótipo más grandes jamás visto. Es un depredador natural. Su especie es endémica del océano Pacífico. Protagonizó una de las batallas más tenaces de la historia, cuando se enfrentó contra El Gran Majá.',
  },
  {
    slug: 'el-gran-maja',
    name: 'El Gran Majá',
    description:
      'Especie de anguila, de comportamiento hostil con los humanos. Apareció por primera vez en el año 2022. Es el único miembro conocido de la especie Cranioplanus risus. Por sus características y naturaleza se trata de un depredador.',
  },
  {
    slug: 'phillip-forte',
    name: 'Phillip Forte',
    description:
      'Biólogo marino, líder actual de la organización llamada DELIRIUM; antiguo miembro de la organización IPCARO. La madre es puertorriqueña, el padre es estadounidense. Lidera a cabo la investigación más importante sobre la nueva fauna marina y su repercusión en el ecosistema.',
  },
];
