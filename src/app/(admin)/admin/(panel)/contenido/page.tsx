import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { LIST_TITLES } from '@/features/admin/server/lists';
import { LIST_DESCRIPTIONS, LIST_ROUTES } from '@/features/admin/lib/list-routes';

export const metadata: Metadata = { title: 'Contenido' };

export default async function AdminContentPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Resto del contenido</h1>
      <ul className="grid gap-4 @2xl:grid-cols-2">
        {Object.entries(LIST_ROUTES).map(([route, key]) => (
          <li key={route} className="crystal-surface rounded-2xl p-5">
            <h2 className="font-bold text-white">
              <Link href={`/admin/contenido/${route}` as Route} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {LIST_TITLES[key]}
              </Link>
            </h2>
            <p className="mt-1 text-white/80">{LIST_DESCRIPTIONS[key]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
