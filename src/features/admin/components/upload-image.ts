import type { LibraryImage } from '../server/media';

/** Sube una imagen al panel. Devuelve la imagen guardada o lanza con el motivo en lenguaje llano. */
export async function uploadImage(file: File): Promise<LibraryImage> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/admin/media', { method: 'POST', body });
  const data = (await response.json().catch(() => ({}))) as LibraryImage & { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'No se pudo subir la imagen.');
  return data;
}
