'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const BTN =
  'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold outline-none transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/**
 * Fallo de render o de red dentro de una página (p. ej. un stream cortado al navegar). Conserva el layout de la ruta:
 * en la wiki el menú lateral sigue ahí. «Reintentar» vuelve a pedir el contenido; «Recargar» hace una carga completa.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="crystal-surface w-full max-w-xl space-y-6 rounded-3xl bg-[#061a2e] p-8 text-center sm:p-12">
        <h1 className="page-title">Algo falló al cargar la página</h1>
        <p className="text-white/70">
          Puede ser un corte de conexión pasajero. Prueba de nuevo; si sigue igual, recarga la página.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => unstable_retry()} className={`${BTN} bg-primary text-[#00122E] hover:bg-primary/90`}>
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${BTN} border border-white/15 text-white/80 hover:text-primary`}
          >
            Recargar
          </button>
          <Link href="/" className={`${BTN} border border-white/15 text-white/80 hover:text-primary`}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
