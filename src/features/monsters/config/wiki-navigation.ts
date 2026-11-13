/**
 * Menú lateral de la wiki tal como viene en los archivos (el panel /admin puede publicar otro por encima: se lee con
 * `getContentRepository().getNavigation()`). Los iconos van por nombre (`NAV_ICON_NAMES`). Puro: sin alias `@/`.
 * `check:content` busca aquí los `url: "/wiki/<slug>"`: mantén ese formato.
 */
import type { NavGroup } from '../../../core/content/navigation.ts';

export type { NavGroup, NavItem } from '../../../core/content/navigation.ts';

export const WIKI_NAVIGATION: NavGroup[] = [
  {
    title: "UNIVERSO COLOSOS",
    items: [
      {
        title: "Wiki",
        url: "/wiki",
        icon: "monitor",
      },
      {
        title: "Libros",
        url: "#",
        icon: "book-open",
        items: [
          { title: "Libros del universo Colosos", url: "/wiki/libros-colosos" },
          { title: "El Destello de los Colosos", url: "/wiki/el-destello-de-los-colosos" },
        ],
      },
      {
        title: "Personajes",
        url: "#",
        icon: "skull",
        items: [
          { 
            title: "Animales", 
            url: "/wiki/animales-colosos",
            items: [
              { title: "El Gran Majá", url: "/wiki/el-gran-maja" },
              { title: "The Bloop", url: "/wiki/the-bloop" },
              { title: "Bogbo", url: "/wiki/bogbo" },
              { title: "Slowdown Criyonte", url: "/wiki/slowdown-criyonte" },
              { title: "Vlad Julia", url: "/wiki/vlad-julia" },
              { title: "Le'Mug", url: "/wiki/le-mug" },
              { title: "Luque", url: "/wiki/luque" },
              { title: "Luddada", url: "/wiki/luddada" },
              { title: "Porcia la gris", url: "/wiki/porcia-la-gris" },
            ]
          },
          { 
            title: "Humanos", 
            url: "/wiki/humanos-colosos",
            items: [
              { title: "Phillip Forte", url: "/wiki/phillip-forte" },
              { title: "Cael Cortés", url: "/wiki/cael-cortes" },
            ]
          },
        ],
      },
      {
        title: "Especies",
        url: "#",
        icon: "microscope",
        items: [
          { title: "Especies identificadas", url: "/wiki/especies" },
          { title: "Cranioplanus risus", url: "/wiki/cranioplanus-risus" },
          { title: "Labodotype macrostoma", url: "/wiki/labodotype-macrostoma" },
          { title: "Kaiserosteus loricatus", url: "/wiki/kaiserosteus-loricatus" },
          { title: "Garddiodon typus", url: "/wiki/garddiodon-typus" },
          { title: "Phiscanula arcticum", url: "/wiki/phiscanula-arcticum" },
          { title: "Lampasiteras", url: "/wiki/lampasiteras" },
        ],
      },
      {
        title: "Categorías",
        url: "#",
        icon: "ghost",
        items: [
          { title: "Categorías de monstruos", url: "/wiki/categorias-monstruos" },
          { title: "Colosos", url: "/wiki/colosos" },
          { title: "Titanes", url: "/wiki/titanes" },
          { title: "Medianos", url: "/wiki/medianos" },
        ],
      },
      {
        title: "Vehículos",
        url: "#",
        icon: "car-front",
        items: [
          { title: "Vehículos y tecnología", url: "/wiki/vehiculos" },
          { title: "Aodos AY01", url: "/wiki/aodos-ay01" },
          { title: "Breegard", url: "/wiki/breegard" },
        ],
      },
      {
        title: "Organizaciones",
        url: "#",
        icon: "shield",
        items: [
          { title: "Todas las organizaciones", url: "/wiki/organizaciones" },
          { title: "IPCARO", url: "/wiki/ipcaro" },
          { title: "DELIRIUM", url: "/wiki/delirium" },
          { title: "Naciones Rebeldes", url: "/wiki/naciones-rebeldes" },
        ],
      },
      {
        title: "Versus",
        url: "/wiki/arena",
        icon: "swords",
      },
    ],
  },
  {
    title: "CAPITÁN DE GALEÓN",
    items: [
      {
        title: "Historia",
        url: "/wiki/capitan-de-galeon",
        icon: "book",
      },
      {
        title: "Navíos",
        url: "/wiki/navios-galeon",
        icon: "ship",
      },
      {
        title: "Piratas",
        url: "/wiki/piratas-galeon",
        icon: "skull",
      },
    ],
  },
  {
    title: "ELLOS LLEGARON",
    items: [
      {
        title: "El Ángel",
        url: "/wiki/el-angel",
        icon: "ghost",
      },
      {
        title: "Cronología WWII",
        url: "/wiki/cronologia-wwii",
        icon: "book",
      },
    ],
  },
  {
    title: "LA HECATOMBE DEL LAPEÓN",
    items: [
      {
        title: "Historia",
        url: "/wiki/la-hecatombe-del-lapeon",
        icon: "book",
      },
    ],
  },
];
