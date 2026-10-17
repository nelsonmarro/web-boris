import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { WikiListFromUrl } from '@/features/monsters/components/WikiListFromUrl';
import { SectionHeader } from '@/features/monsters/components/wiki/SectionHeader';
import { getFilterOptions } from '@/features/monsters/actions/get-wiki-articles';

export async function WikiExplorerSection() {
  const options = await getFilterOptions();

  return (
    <section id="explorar" className="relative space-y-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Biblioteca"
        title={<>Explorar <span className="text-primary">todos los registros</span></>}
        description="Busca por nombre o filtra por universo y categoría."
      />
      <div className="relative">
        <div className="pointer-events-none absolute -inset-4 rounded-full bg-primary/5 opacity-30 blur-[80px]" />
        {/* useSearchParams exige un límite de Suspense para no des-optimizar la página estática. */}
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          }
        >
          <WikiListFromUrl options={options} />
        </Suspense>
      </div>
    </section>
  );
}
