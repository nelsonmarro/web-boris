import 'server-only';
import { revalidatePath } from 'next/cache';
import { invalidateCmsCache } from './cms-repository';

/**
 * Hace visible lo recién publicado: vacía la lectura en memoria y marca todas las páginas para regenerarse en su
 * siguiente visita. El sitio es pequeño y una ficha aparece en muchas páginas (listados, relacionados, enlaces
 * automáticos, búsqueda, landing, sitemap), así que se revalida entero en lugar de calcular qué páginas toca.
 */
export function revalidateContent(): void {
  invalidateCmsCache();
  revalidatePath('/', 'layout');
}
