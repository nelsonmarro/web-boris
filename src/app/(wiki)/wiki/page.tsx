import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';

/** El archivo se lee de los MDX; se revalida cada hora. */
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Wiki | Universos de BorisaoBlois',
  description: 'Explora el archivo de criaturas, personajes y lugares de los universos de BorisaoBlois.',
  path: '/wiki',
});

export default function WikiIndex() {
  return (
    <div className="wiki-container flex-1 py-10 lg:py-14">
      <WikiExplorerSection />
    </div>
  );
}
