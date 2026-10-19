import { NextResponse, type NextRequest } from 'next/server';
import { getEntityIndex } from '@/core/content/entities';
import { pickRandomExcluding, wikiSlugFromReferer } from '@/core/search/random-pick';
import { registroSlugs } from '@/core/search/registro';

/** Cada visita elige otra ficha: el resultado no se cachea ni se genera en el build. */
export const dynamic = 'force-dynamic';

/**
 * «Expediente aleatorio» (spec Ola C §5): redirige a una ficha al azar. Candidatas: las mismas del registro
 * (`registroSlugs`: sin directorios ni páginas de categoría y sin las sellados, que llevarían a un expediente
 * vacío), salvo la ficha desde la que se pulsó, que se lee del `Referer` y solo sirve para excluirla.
 */
export async function GET(request: NextRequest) {
  const { entries } = await getEntityIndex();
  const slug = pickRandomExcluding(
    registroSlugs(entries),
    wikiSlugFromReferer(request.headers.get('referer')),
    Math.random,
  );
  // `Location` relativo: `NextResponse.redirect` solo admite URLs absolutas, y la absoluta dependería del host que
  // Next cree ver detrás del proxy. Un 307 no debe quedarse en la caché de un CDN o del navegador: cambia cada vez.
  return new NextResponse(null, {
    status: 307,
    headers: { Location: slug ? `/wiki/${slug}` : '/wiki', 'Cache-Control': 'no-store' },
  });
}
