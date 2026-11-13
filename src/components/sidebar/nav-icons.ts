import { Book, BookOpen, CarFront, Ghost, Microscope, Monitor, Ship, Shield, Skull, Swords, type LucideIcon } from 'lucide-react';
import type { NavIconName } from '@/core/content/navigation';

/** Componente de cada icono del menú (el menú guarda el nombre, `NAV_ICON_NAMES`). */
export const NAV_ICON_COMPONENTS: Record<NavIconName, LucideIcon> = {
  monitor: Monitor,
  'book-open': BookOpen,
  book: Book,
  skull: Skull,
  microscope: Microscope,
  ghost: Ghost,
  'car-front': CarFront,
  shield: Shield,
  swords: Swords,
  ship: Ship,
};

/** Nombre de cada icono para el panel. */
export const NAV_ICON_LABELS: Record<NavIconName, string> = {
  monitor: 'Pantalla',
  'book-open': 'Libro abierto',
  book: 'Libro',
  skull: 'Calavera',
  microscope: 'Microscopio',
  ghost: 'Fantasma',
  'car-front': 'Vehículo',
  shield: 'Escudo',
  swords: 'Espadas',
  ship: 'Barco',
};
