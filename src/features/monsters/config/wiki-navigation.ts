import { LucideIcon, Ghost, User, Microscope, Ship, Shield, Skull, Book, BookOpen, Swords } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
}

export interface WikiUniverseNavigation {
  title: string;
  slug: string;
  items: NavItem[];
}

export const WIKI_NAVIGATION: WikiUniverseNavigation[] = [
  {
    title: "Universo Colosos",
    slug: "colosos",
    items: [
      {
        title: "Wiki",
        url: "/wiki",
        icon: Book,
      },
      {
        title: "Libros",
        url: "/wiki/libros-colosos",
        icon: BookOpen,
        items: [
          { title: "El Destello de los Colosos", url: "/wiki/el-destello-de-los-colosos" },
        ]
      },
      {
        title: "Personajes",
        url: "/wiki/personajes-colosos",
        icon: Skull,
        items: [
          {
            title: "Animales",
            url: "/wiki/animales-colosos",
            items: [
              { title: "El Gran Majá", url: "/wiki/el-gran-maja" },
              { title: "The Bloop", url: "/wiki/the-bloop" },
              { title: "Vlad Julia", url: "/wiki/vlad-julia" },
              { title: "Slowdown Criyote", url: "/wiki/slowdown-criyote" },
              { title: "Luddada", url: "/wiki/luddada" },
              { title: "Luque", url: "/wiki/luque" },
              { title: "Pelula", url: "/wiki/pelula" },
              { title: "Lellymot", url: "/wiki/lellymot" },
              { title: "Le'Mug", url: "/wiki/le-mug" },
              { title: "Porcia la gris", url: "/wiki/porcia-la-gris" },
              { title: "Codateo", url: "/wiki/codateo" },
              { title: "Caletonia", url: "/wiki/caletonia" },
              { title: "Bogbo", url: "/wiki/bogbo" },
              { title: "Lathasus", url: "/wiki/lathasus" },
              { title: "Solón", url: "/wiki/solon" },
              { title: "Otto Reinheit", url: "/wiki/otto-reinheit" },
            ],
          },
          {
            title: "Humanos",
            url: "/wiki/humanos-colosos",
            items: [
              { title: "Phillip Forte", url: "/wiki/phillip-forte" },
              { title: "Cael Cortés", url: "/wiki/cael-cortes" },
              { title: "Tabata Reyes", url: "/wiki/tabata-reyes" },
              { title: "Jorge", url: "/wiki/jorge" },
              { title: "Dylan", url: "/wiki/dylan" },
              { title: "Alex", url: "/wiki/alex" },
              { title: "Renata", url: "/wiki/renata" },
            ],
          },
        ],
      },
      {
        title: "Especies",
        url: "/wiki/especies",
        icon: Microscope,
        items: [
          { title: "Supperbial anguilla", url: "/wiki/supperbial-anguilla" },
          { title: "Labodotype macrostoma", url: "/wiki/labodotype-macrostoma" },
          { title: "Kaiserosteus loricatus", url: "/wiki/kaiserosteus-loricatus" },
          { title: "Garddiodon typus", url: "/wiki/garddiodon-typus" },
          { title: "Phiscanula arcticum", url: "/wiki/phiscanula-arcticum" },
        ],
      },
      {
        title: "Categorías",
        url: "/wiki/categorias-monstruos",
        icon: Ghost,
        items: [
          { title: "Colosos", url: "/wiki/categoria-colosos" },
          { title: "Titanes", url: "/wiki/categoria-titanes" },
          { title: "Medianos", url: "/wiki/categoria-medianos" },
        ],
      },
      {
        title: "Vehículos",
        url: "/wiki/vehiculos",
        icon: Ship,
        items: [
          { title: "Aodos AY01", url: "/wiki/aodos-ay01" },
          { title: "Breegard", url: "/wiki/breegard" },
        ],
      },
      {
        title: "Organizaciones",
        url: "/wiki/organizaciones",
        icon: Shield,
        items: [
          { title: "IPCARO", url: "/wiki/ipcaro" },
          { title: "DELIRIUM", url: "/wiki/delirium" },
          { title: "Naciones Rebeldes", url: "/wiki/naciones-rebeldes" },
        ],
      },
      {
        title: "Versus",
        url: "/wiki/arena",
        icon: Swords,
      }
    ],
  },
  {
    title: "Capitán de Galeón",
    slug: "capitan-de-galeon",
    items: [
      { title: "Historia", url: "/wiki/capitan-de-galeon", icon: Book },
      { title: "Navíos", url: "/wiki/navios-galeon", icon: Ship },
      { title: "Piratas", url: "/wiki/piratas-galeon", icon: Skull },
    ],
  },
  {
    title: "Ellos Llegaron",
    slug: "ellos-llegaron",
    items: [
      { title: "El Ángel", url: "/wiki/el-angel", icon: Ghost },
      { title: "Cronología WWII", url: "/wiki/cronologia-wwii", icon: Book },
    ],
  },
];
