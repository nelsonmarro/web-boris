import { WikiList } from '@/features/monsters/components/WikiList';
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
        <WikiList options={options} />
      </div>
    </section>
  );
}
