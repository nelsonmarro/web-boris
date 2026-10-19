import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { WikiList } from '@/features/monsters/components/WikiList';
import { getFilterOptions } from '@/features/monsters/actions/get-wiki-articles';

/**
 * Esqueleto que ve el HTML estático mientras WikiList se hidrata. Reserva el hueco del buscador y las
 * pestañas y lleva los mismos anclajes (#explorar, #catalogo): una carga directa con hash
 * (`/wiki?universe=…#catalogo`) encuentra el destino sin esperar a la hidratación.
 */
function WikiListFallback() {
  return (
    <div role="status">
      <div className="mb-6 h-14 max-w-2xl rounded-xl border border-white/10 bg-[#061a2e]" />
      <div className="h-[6.5rem] lg:h-11" />
      <span id="explorar" className="block scroll-mt-24" />
      <div id="catalogo" className="mt-8 flex min-h-[400px] scroll-mt-24 items-center justify-center">
        <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-primary motion-reduce:animate-none" />
        <span className="sr-only">Cargando el archivo</span>
      </div>
    </div>
  );
}

/** Portada de la wiki (spec #55 §4): cabecera, buscador, pestañas por tipo y catálogo. */
export async function WikiExplorerSection() {
  const options = await getFilterOptions();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="page-title">Archivo</h1>
        <p className="text-lg text-white/70">
          Criaturas, personajes, organizaciones e historia de los universos de BorisaoBlois.
        </p>
      </header>
      {/* useSearchParams exige un límite de Suspense para no des-optimizar la página estática. */}
      <Suspense fallback={<WikiListFallback />}>
        <WikiList options={options} />
      </Suspense>
    </div>
  );
}
