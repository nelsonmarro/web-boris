'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { getLibrary, type Library } from '../../actions/media';
import { uploadImage } from '../upload-image';
import type { LibraryImage } from '../../server/media';
import { FIELD, HINT, SMALL_BUTTON } from './field-styles';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (image: LibraryImage) => void;
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Selector de imágenes (diálogo nativo): las subidas desde el panel y las que ya tiene la web, con subida directa. */
export function MediaPicker({ open, onClose, onSelect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [tab, setTab] = useState<'uploads' | 'assets'>('uploads');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      getLibrary().then((result) => {
        setLibrary(result);
        if (result.uploads.length === 0) setTab('assets');
      }, () => setStatus('No se pudo cargar la biblioteca.'));
    }
    if (!open && element.open) element.close();
  }, [open]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setStatus('Subiendo…');
    try {
      const image = await uploadImage(files[0]);
      setStatus('');
      onSelect(image);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const images = (tab === 'uploads' ? library?.uploads : library?.assets) ?? [];
  const shown = query ? images.filter((image) => normalize(`${image.name} ${image.alt}`).includes(normalize(query))) : images;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="titulo-biblioteca"
      onClose={onClose}
      className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-2xl border border-white/15 bg-[#00122E] p-0 text-white backdrop:bg-black/70"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
          <h2 id="titulo-biblioteca" className="min-w-0 flex-1 text-xl font-bold">
            Elegir imagen
          </h2>
          <label className={`${SMALL_BUTTON} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary`}>
            <Upload aria-hidden="true" className="size-4" />
            {uploading ? 'Subiendo…' : 'Subir una imagen'}
            <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => upload(event.target.files)} />
          </label>
          <button type="button" className={SMALL_BUTTON} onClick={() => dialog.current?.close()}>
            <X aria-hidden="true" className="size-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <div className="space-y-3 border-b border-white/10 p-4">
          <div role="tablist" aria-label="Origen de las imágenes" className="flex flex-wrap gap-2">
            {(
              [
                ['uploads', `Subidas (${library?.uploads.length ?? '…'})`],
                ['assets', `De la web (${library?.assets.length ?? '…'})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`${SMALL_BUTTON} ${tab === id ? 'border-primary text-primary' : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="sr-only">Buscar imagen</span>
            <input className={FIELD} value={query} placeholder="Buscar por nombre" onChange={(event) => setQuery(event.target.value)} />
          </label>
          <p role="status" className={HINT}>
            {status || (library ? `${shown.length} ${shown.length === 1 ? 'imagen' : 'imágenes'}` : 'Cargando…')}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 overflow-y-auto p-4 @md:grid-cols-3 @3xl:grid-cols-4" role="list">
          {shown.map((image) => (
            <li key={image.path}>
              <button
                type="button"
                className="group block w-full overflow-hidden rounded-xl border border-white/15 bg-[#061a2e] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:border-primary"
                onClick={() => onSelect(image)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- miniaturas del panel: sin optimizar, cargan al verse */}
                <img src={image.path} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                <span className="block truncate px-2 py-1.5 text-sm text-white/90">{image.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
