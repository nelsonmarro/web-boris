'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2, Upload } from 'lucide-react';
import { deleteMediaAction, updateMediaAltAction } from '../actions/media';
import { uploadImage } from './upload-image';
import { DANGER_BUTTON, FIELD, HINT, SMALL_BUTTON } from './editor/field-styles';

export interface MediaItem {
  id: string;
  path: string;
  name: string;
  alt: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
}

const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

/** Biblioteca de imágenes subidas: subir varias a la vez, texto alternativo, copiar la ruta y borrar las que no se usan. */
export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const failed: string[] = [];
    let done = 0;
    for (const file of Array.from(files)) {
      setStatus(`Subiendo ${done + 1} de ${files.length}…`);
      try {
        await uploadImage(file);
        done += 1;
      } catch (error) {
        failed.push(`${file.name}: ${error instanceof Error ? error.message : 'error'}`);
      }
    }
    setBusy(false);
    setStatus([done ? `${done} imagen(es) subida(s).` : '', ...failed].filter(Boolean).join(' '));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-2xl border border-dashed border-white/25 p-6 text-center">
        <label className={`${SMALL_BUTTON} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary`}>
          <Upload aria-hidden="true" className="size-4" />
          {busy ? 'Subiendo…' : 'Subir imágenes'}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(event) => upload(event.target.files)} />
        </label>
        <p className={HINT}>JPG, PNG, WebP, AVIF, GIF o HEIC, hasta 20 MB. Se guardan en WebP de como mucho 2560 px y sin datos del archivo (como la ubicación GPS).</p>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-white/90">
        {status}
      </p>
      {items.length === 0 ? (
        <p className="text-white/70">Todavía no se ha subido ninguna imagen.</p>
      ) : (
        <ul className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-3 overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
              <img src={item.path} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              <div className="space-y-3 px-4">
                <p className="truncate font-semibold text-white" title={item.name}>
                  {item.name}
                </p>
                <p className={HINT}>
                  {item.width}×{item.height} px · {kb(item.bytes)}
                </p>
                <label className="block space-y-1">
                  <span className="block text-sm font-bold text-white">Texto alternativo por defecto</span>
                  <input
                    className={FIELD}
                    defaultValue={item.alt}
                    maxLength={300}
                    onBlur={(event) => {
                      if (event.target.value !== item.alt) startTransition(() => void updateMediaAltAction(item.id, event.target.value));
                    }}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={SMALL_BUTTON}
                    onClick={() => navigator.clipboard?.writeText(item.path).then(() => setStatus(`Ruta copiada: ${item.path}`))}
                  >
                    <Copy aria-hidden="true" className="size-4" />
                    Copiar ruta<span className="sr-only"> de {item.name}</span>
                  </button>
                  <button
                    type="button"
                    className={DANGER_BUTTON}
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(`¿Borrar «${item.name}»? Solo se puede si ninguna ficha la usa.`)) return;
                      startTransition(async () => {
                        const result = await deleteMediaAction(item.id);
                        setStatus(result.message);
                        if (result.ok) router.refresh();
                      });
                    }}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Borrar<span className="sr-only"> {item.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
