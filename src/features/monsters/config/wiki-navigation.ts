import { 
  BookOpen, 
  Skull, 
  Microscope, 
  Ghost, 
  CarFront, 
  Shield, 
  Swords, 
  Book, 
  Ship, 
  Monitor,
  LucideIcon
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
}

interface UniverseNav {
  title: string;
  items: NavItem[];
}

export const WIKI_NAVIGATION: UniverseNav[] = [
  {
    title: "UNIVERSO COLOSOS",
    items: [
      {
        title: "Wiki",
        url: "/wiki",
        icon: Monitor,
      },
      {
        title: "Libros",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Libros del universo Colosos", url: "/wiki/libros-colosos" },
          { title: "El Destello de los Colosos", url: "/wiki/el-destello-de-los-colosos" },
        ],
      },
      {
        title: "Personajes",
        url: "#",
        icon: Skull,
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
        icon: Microscope,
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
        icon: Ghost,
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
        icon: CarFront,
        items: [
          { title: "Vehículos y tecnología", url: "/wiki/vehiculos" },
          { title: "Aodos AY01", url: "/wiki/aodos-ay01" },
          { title: "Breegard", url: "/wiki/breegard" },
        ],
      },
      {
        title: "Organizaciones",
        url: "#",
        icon: Shield,
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
        icon: Swords,
      },
    ],
  },
  {
    title: "CAPITÁN DE GALEÓN",
    items: [
      {
        title: "Historia",
        url: "/wiki/capitan-de-galeon",
        icon: Book,
      },
      {
        title: "Navíos",
        url: "/wiki/navios-galeon",
        icon: Ship,
      },
      {
        title: "Piratas",
        url: "/wiki/piratas-galeon",
        icon: Skull,
      },
    ],
  },
  {
    title: "ELLOS LLEGARON",
    items: [
      {
        title: "El Ángel",
        url: "/wiki/el-angel",
        icon: Ghost,
      },
      {
        title: "Cronología WWII",
        url: "/wiki/cronologia-wwii",
        icon: Book,
      },
    ],
  },
  {
    title: "LA HECATOMBE DEL LAPEÓN",
    items: [
      {
        title: "Historia",
        url: "/wiki/la-hecatombe-del-lapeon",
        icon: Book,
      },
    ],
  },
];
