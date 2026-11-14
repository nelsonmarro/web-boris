import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { GuideContent } from '@/features/admin/components/GuideContent';
import { guideSections } from '@/features/admin/lib/guide';

export const metadata: Metadata = { title: 'Ayuda' };

/** Manual del panel para Boris: `src/content/panel/guia.md` (va en la imagen con el resto de `src/content`). */
const GUIDE = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'content', 'panel', 'guia.md');

export default async function AdminHelpPage() {
  await requireAdmin();
  const guide = await fs.readFile(GUIDE, 'utf8');
  const sections = guideSections(guide);
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Cómo usar el panel</h1>
        <p className="text-lg text-white/80">
          Elige lo que quieres hacer. Cada apartado va paso a paso, y los números de las capturas son los de los pasos. En el
          editor de una ficha, <strong className="text-white">Ver el recorrido</strong> te lo enseña sobre la propia pantalla.
        </p>
      </div>

      <nav aria-labelledby="tareas" className="space-y-4">
        <h2 id="tareas" className="text-xl font-bold text-white">
          ¿Qué quieres hacer?
        </h2>
        <ol className="grid gap-3 @lg:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex h-full gap-4 rounded-2xl border border-white/10 bg-[#061a2e] p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
              >
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/60 font-bold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white">{section.title}</span>
                  {section.summary ? <span className="mt-1 block text-sm text-white/70">{section.summary}</span> : null}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <GuideContent source={guide} />
    </div>
  );
}
