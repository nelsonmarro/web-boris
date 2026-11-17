/**
 * Mensajes de Zod en español para lo que no lleva mensaje propio (lo importan las comprobaciones del panel, cuyos
 * avisos lee Boris). Es global: Zod guarda la configuración en el módulo. Puro.
 */
import { z } from 'zod';

z.config(z.locales.es());
