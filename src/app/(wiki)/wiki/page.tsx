import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';

/** El archivo se lee de los MDX; se revalida cada hora. */
export const revalidate = 3600;

export default function WikiIndex() {
  return (
    <div className="wiki-container flex-1 py-10 lg:py-14">
      <WikiExplorerSection />
    </div>
  );
}
