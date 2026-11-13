import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isValidSlug } from '@/core/content/overlay';

/** Dirección antigua de la vista previa: ahora vive fuera del marco del panel (`/admin/vista-previa/<ficha>`). */
export default async function OldPreviewRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  redirect(`/admin/vista-previa/${slug}` as Route);
}
