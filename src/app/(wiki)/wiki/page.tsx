import { WikiHomeMosaic } from '@/features/monsters/components/wiki/WikiHomeMosaic';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';

/** Criatura y duelo de la semana cambian sin rebuild. */
export const revalidate = 3600;

export default function WikiIndex() {
  return (
    <div className="wiki-container flex-1 space-y-12 py-10 lg:space-y-16 lg:py-14">
      <WikiHomeMosaic />
      <WikiExplorerSection />
    </div>
  );
}
