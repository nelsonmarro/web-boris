import type { Metadata } from 'next';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { listUploads } from '@/features/admin/server/media';
import { MediaLibrary } from '@/features/admin/components/MediaLibrary';

export const metadata: Metadata = { title: 'Imágenes' };

export default async function AdminImagesPage() {
  await requireAdmin();
  const items = await listUploads();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Imágenes</h1>
      <p className="text-white/80">
        Las imágenes que subas aquí (o desde el editor de una ficha) se pueden usar como portada o dentro del texto de cualquier
        ficha. Las que ya tenía la web también aparecen al elegir una imagen.
      </p>
      <MediaLibrary items={items} />
    </div>
  );
}
