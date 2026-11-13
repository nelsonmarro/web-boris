/** Universos que se pueden elegir en el panel (los de la landing). Puro. */
import { UNIVERSES } from '../../marketing/config/universes.ts';

export const UNIVERSE_OPTIONS: string[] = UNIVERSES.map((universe) => universe.universeKey).filter((key): key is string => !!key);
