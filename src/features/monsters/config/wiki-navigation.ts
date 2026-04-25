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
          { title: "El Destello de los Colos...", url: "/wiki/libros-colosos" },
        ],
      },
      {
        title: "Personajes",
        url: "#",
        icon: Skull,
        items: [
          { title: "Animales", url: "/wiki/animales-colosos" },
          { title: "Humanos", url: "/wiki/humanos-colosos" },
        ],
      },
      {
        title: "Especies",
        url: "#",
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
        url: "#",
        icon: Ghost,
        items: [
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
          { title: "Aodos AY01", url: "/wiki/aodos-ay01" },
          { title: "Breegard", url: "/wiki/breegard" },
        ],
      },
      {
        title: "Organizaciones",
        url: "#",
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
      },
    ],
  },
  {
    title: "CAPITÁN DE GALEÓN",
    items: [
      {
        title: "Historia",
        url: "/wiki/historia-galeon",
        icon: Book,
      },
      {
        title: "Navíos",
        url: "/wiki/navios-galeon",
        icon: Ship,
      },
      {
        title: "Piratas",
        url: "/wiki/piratas",
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
];
