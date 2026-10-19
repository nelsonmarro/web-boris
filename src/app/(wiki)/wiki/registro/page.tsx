import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { Section } from '@/components/content';
import { getEntityIndex } from '@/core/content/entities';
import { registroEntries, registroSlugs } from '@/core/search/registro';
import { RegistroGrid, type RegistroGridItem } from '@/features/monsters/components/wiki/registro/RegistroGrid';
import { RegistroProgress } from '@/features/monsters/components/wiki/registro/RegistroProgress';

/** Los expedientes se leen de los MDX; se revalida cada hora. El progreso del fan se pinta en el navegador. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Registro del archivo | Wiki BorisaoBlois',
  description:
    'Lleva la cuenta de los expedientes del archivo de BorisaoBlois que has abierto. El registro se guarda solo en tu navegador.',
};

const TEXT_LINK =
  'inline-flex min-h-11 items-center rounded-sm text-white/80 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

export default async function RegistroPage() {
  const { entries } = await getEntityIndex();
  const groups = registroEntries(entries);
  const sealed = groups.flatMap((g) => g.items).filter((e) => e.status === 'proximamente');

  return (
    <div className="wiki-container flex-1 py-10 lg:py-14">
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="space-y-3">
            <h1 className="page-title">Registro del archivo</h1>
            <p className="text-lg text-white/70">
              Cada expediente que abres queda marcado aquí. El registro se guarda solo en este navegador.
            </p>
          </div>
          <RegistroProgress slugs={registroSlugs(entries)} />
        </header>

        {groups.map((group) => (
          <Section key={group.tipo} id={`registro-${group.tipo}`} title={group.label} contained={false}>
            <RegistroGrid
              items={group.items.map(
                (e): RegistroGridItem => ({
                  slug: e.slug,
                  title: e.title,
                  category: e.category,
                  image: e.image,
                  imagePosition: e.imagePosition,
                  sealed: e.status === 'proximamente',
                }),
              )}
            />
          </Section>
        ))}

        {sealed.length > 0 && (
          <Section id="pendiente" title="Pendiente de desclasificar" contained={false}>
            <p className="mb-4 text-white/70">Boris aún no ha desclasificado estos expedientes.</p>
            <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {sealed.map((e) => (
                <li key={e.slug}>
                  <Link href={`/wiki/${e.slug}` as Route} className={TEXT_LINK}>
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
