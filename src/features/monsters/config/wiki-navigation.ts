import { 
  Skull, 
  Zap, 
  Anchor, 
  ShieldAlert, 
  Map, 
  Clock, 
  Flame,
  Info,
  Layers,
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
    title: "Universo Colosos",
    items: [
      {
        title: "Bestiario Principal",
        url: "/wiki/animales-colosos",
        icon: Skull,
        items: [
          { title: "The Bloop", url: "/wiki/the-bloop" },
          { title: "El Gran Majá", url: "/wiki/el-gran-maja" },
          { title: "Phillip", url: "/wiki/phillip" },
          { title: "Bogbo", url: "/wiki/bogbo" },
        ],
      },
      {
        title: "Sectores Críticos",
        url: "#",
        icon: Map,
        items: [
          { title: "Fosa de las Marianas", url: "/wiki/fosa-marianas" },
          { title: "Isla de la Calavera", url: "/wiki/isla-calavera" },
        ],
      },
      {
        title: "Alertas Activas",
        url: "#",
        icon: ShieldAlert,
      },
    ],
  },
  {
    title: "Universo Capitán de Galeón",
    items: [
      {
        title: "Navíos Legendarios",
        url: "/wiki/barcos",
        icon: Anchor,
        items: [
          { title: "Galeón de Borisao", url: "/wiki/galeon-borisao" },
          { title: "El Holandés Errante", url: "/wiki/holandes-errante" },
        ],
      },
      {
        title: "Personajes",
        url: "/wiki/personajes-galeon",
        icon: Layers,
      },
    ],
  },
  {
    title: "Universo Ellos Llegaron",
    items: [
      {
        title: "Cronología de Guerra",
        url: "/wiki/cronologia",
        icon: Clock,
      },
      {
        title: "Tecnología Alienígena",
        url: "/wiki/tecnologia",
        icon: Zap,
      },
      {
        title: "Protocolos de Supervivencia",
        url: "/wiki/protocolos",
        icon: Flame,
      },
    ],
  },
  {
    title: "Recursos",
    items: [
      {
        title: "Acerca de la Wiki",
        url: "/wiki",
        icon: Info,
      },
    ],
  },
];
