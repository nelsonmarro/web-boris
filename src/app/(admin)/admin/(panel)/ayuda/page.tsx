import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { MdxRenderer } from '@/features/monsters/components/wiki/mdx/MdxRenderer';

export const metadata: Metadata = { title: 'Ayuda' };

/** Guía del panel para Boris: `src/content/panel/guia.md` (va en la imagen con el resto de `src/content`). */
const GUIDE = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'content', 'panel', 'guia.md');

export default async function AdminHelpPage() {
  await requireAdmin();
  const guide = await fs.readFile(GUIDE, 'utf8');
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-white">Cómo usar el panel</h1>
      <MdxRenderer content={guide} />
    </div>
  );
}
