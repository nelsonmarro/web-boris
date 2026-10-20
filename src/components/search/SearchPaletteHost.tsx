'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useSearchPalette } from './useSearchPalette';

/**
 * Respaldo si el chunk de la paleta no llega (sin red, o un despliegue nuevo que ya no lo tiene). Una carga
 * fallida no se reintenta hasta recargar la página: cada apertura cierra la paleta y ofrece recargar, en lugar
 * de que el error de render tumbe la página entera.
 */
function PaletteUnavailable() {
  const open = useSearchPalette((s) => s.open);
  React.useEffect(() => {
    if (!open) return;
    useSearchPalette.getState().close();
    toast.error('No se pudo abrir la búsqueda.', {
      action: { label: 'Recargar', onClick: () => window.location.reload() },
    });
  }, [open]);
  return null;
}

/** La paleta pesa (búsqueda, Dialog, TanStack Query): su chunk solo se pide al abrirla por primera vez. */
const SearchPalette = dynamic(
  () =>
    import('./SearchPalette')
      .then((m) => m.SearchPalette)
      .catch(() => PaletteUnavailable),
  { ssr: false },
);

/**
 * Pide el chunk de la paleta antes de abrirla (hover / foco de los disparadores). Si falla, se ignora aquí: la
 * apertura recibe el mismo fallo y muestra el aviso de `PaletteUnavailable`.
 */
export const preloadSearchPalette = () => void import('./SearchPalette').catch(() => {});

/** Cualquier modal abierto que no sea la paleta (hojas de vaul y diálogos de Radix / Base UI); la paleta lleva `data-search-palette`. */
const OTHER_MODAL = '[data-vaul-drawer]:not([data-search-palette]), [role="dialog"]:not([data-search-palette])';

/**
 * Se monta una vez en el layout raíz, dentro de `Providers`. Lleva el atajo ⌘K / Ctrl+K (funciona antes de
 * que cargue la paleta) y monta `SearchPalette` tras la primera apertura; después se queda montada para
 * conservar la animación de cierre.
 */
export function SearchPaletteHost() {
  const open = useSearchPalette((s) => s.open);
  const [loaded, setLoaded] = React.useState(open);
  // Ajuste durante el render: una vez abierta, la paleta ya no se desmonta.
  if (open && !loaded) setLoaded(true);

  // ⌘K / Ctrl+K abre o cierra la paleta desde cualquier página. No la abre encima de otro modal (la hoja del
  // índice, el visor de imágenes, el menú móvil…): dos diálogos a la vez se roban el foco y el scroll lock.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (event.repeat) return;
        const state = useSearchPalette.getState();
        if (state.open) state.close();
        else if (!document.querySelector(OTHER_MODAL)) state.openPalette();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return loaded ? <SearchPalette /> : null;
}
