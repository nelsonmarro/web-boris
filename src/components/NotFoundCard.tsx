import Link from 'next/link';
import { SearchTrigger } from '@/components/search/SearchTrigger';

const LINK =
  'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold outline-none transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** Tarjeta del 404 (mensaje, buscador y salidas). La usan el 404 del sitio y el de la wiki, cada uno con su marco. */
export function NotFoundCard() {
  return (
    <div className="crystal-surface w-full max-w-xl space-y-6 rounded-3xl bg-[#061a2e] p-8 text-center sm:p-12">
      <p className="text-6xl font-black text-primary" aria-hidden="true">
        404
      </p>
      <h1 className="page-title">Este expediente no existe</h1>
      <p className="text-white/70">
        El enlace que seguiste no lleva a ninguna página. Puede que esté mal escrito o que la ficha haya cambiado de
        nombre.
      </p>
      <SearchTrigger variant="hero" placeholder="Busca una ficha" className="mx-auto" />
      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/" className={`${LINK} bg-primary text-[#00122E] hover:bg-primary/90`}>
          Inicio
        </Link>
        <Link href="/wiki" className={`${LINK} border border-white/15 text-white/80 hover:text-primary`}>
          Archivo
        </Link>
        {/* Route handler `force-dynamic`: nunca se precarga (ver CLAUDE.md). */}
        <Link
          href="/wiki/aleatorio"
          prefetch={false}
          className={`${LINK} border border-white/15 text-white/80 hover:text-primary`}
        >
          Expediente aleatorio
        </Link>
      </div>
    </div>
  );
}
