import { NextResponse, type NextRequest } from 'next/server';
import { getEntityIndex } from '@/core/content/entities';
import { isIndexCategory } from '@/core/search/catalog';
import { pickRandom } from '@/core/search/random-pick';

/** Cada visita elige otra ficha: el resultado no se cachea ni se genera en el build. */
export const dynamic = 'force-dynamic';

/**
 * «Expediente aleatorio» (spec Ola C §5): redirige a una ficha al azar. Candidatas: las fichas con contenido, sin
 * directorios ni páginas de categoría y sin las «Próximamente» (llevarían a un expediente vacío).
 */
export async function GET(request: NextRequest) {
  const { entries } = await getEntityIndex();
  const candidates = entries.filter((e) => !isIndexCategory(e.category) && e.status !== 'proximamente');
  const pick = pickRandom(candidates, Math.random);
  const response = NextResponse.redirect(new URL(pick ? `/wiki/${pick.slug}` : '/wiki', request.url), 307);
  // El 307 no debe quedarse en la caché de un CDN o del navegador: la gracia es que cambia cada vez.
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
