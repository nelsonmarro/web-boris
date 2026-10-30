import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { ARENA_ROUTE, ESCALA_ROUTE, TAMANOS_ROUTE } from '@/core/search/wiki-routes';
import { creatureSizeEntries, withReferences } from '@/features/monsters/lib/size-references';
import { SizeScale } from '@/features/monsters/components/size/SizeScale';

/** Las longitudes salen de los MDX (`stats.length`); se revalida cada hora, como el registro. */
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Escala de tamaños | Wiki BorisaoBlois',
  description:
    'Los colosos del archivo de BorisaoBlois ordenados por longitud, junto a referencias reales como la ballena azul, el Titanic o el Burj Khalifa.',
  path: ESCALA_ROUTE,
});

const CTA =
  'inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[12px] font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2339] motion-reduce:transition-none';
const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

export default async function EscalaPage() {
  const creatures = creatureSizeEntries(await getContentRepository().getArticles());
  const entries = withReferences(creatures);

  return (
    <div className="wiki-container flex-1 py-10 lg:py-14">
      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="page-title">Escala de tamaños</h1>
          <p className="max-w-3xl text-lg text-white/70">
            Los {creatures.length} expedientes del archivo con longitud registrada, del más largo al más corto, junto a
            construcciones y animales del mundo real para hacerse una idea de lo que miden. Se compara la longitud, no la
            corpulencia: el animal más largo no tiene por qué ser el más grande.
          </p>
          {/* Leyenda: el color no es la única pista (la línea de cada fila dice «Referencia real»). */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3 w-8 rounded-full bg-gradient-to-r from-primary/60 to-primary" />
              Expediente del archivo
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-8 rounded-full bg-[repeating-linear-gradient(135deg,rgb(125_211_252/0.75)_0_6px,rgb(125_211_252/0.4)_6px_12px)]"
              />
              Referencia real: dato del mundo real, no del lore
            </li>
          </ul>
        </header>

        <section aria-labelledby="escala-titulo">
          <h2 id="escala-titulo" className="sr-only">
            Por longitud, de mayor a menor
          </h2>
          <SizeScale entries={entries} labelledBy="escala-titulo" />
          <p className="mt-4 text-sm text-white/60">
            Criaturas: longitud según su expediente, escrita como allí («≈» si es aproximada, «más de» si es un mínimo).
            Referencias reales: longitud de una ballena azul adulta grande, eslora del Titanic y altura total de los
            edificios.
          </p>
        </section>

        <Section id="ponte-a-prueba" title="¿Quién mide más?" contained={false}>
          <p className="mb-5 max-w-2xl text-white/70">
            Dos medidas, una elección. Encadena aciertos y bate tu mejor racha.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href={TAMANOS_ROUTE as Route} className={CTA}>
              Jugar
            </Link>
            <Link href={ARENA_ROUTE as Route} className={TEXT_LINK}>
              Versus Arena <span aria-hidden="true">›</span>
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
