'use client';

import * as React from 'react';
import { Menu } from '@base-ui/react/menu';
import { Share2, History, Printer, Check, Ellipsis } from 'lucide-react';
import { toast } from 'sonner';

interface WikiArticleActionsProps {
  title: string;
}

const MENU_ITEM =
  'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-white/85 outline-hidden select-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white';

export function WikiArticleActions({ title }: WikiArticleActionsProps) {
  const [isCopying, setIsCopying] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | Wiki BorisaoBlois`,
      text: `Explora el lore de ${title} en la Wiki oficial de BorisaoBlois.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error al compartir:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopying(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setIsCopying(false), 2000);
      } catch {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const handleHistory = () => {
    toast.info('El historial de revisiones estará disponible próximamente en la versión Beta.');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="flex h-11 items-center gap-2 rounded-xl bg-primary/10 px-4 text-[12px] font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-[#00122E] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
      >
        {isCopying ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
        {isCopying ? 'Copiado' : 'Compartir'}
      </button>

      <Menu.Root modal={false}>
        <Menu.Trigger
          aria-label="Más acciones"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary data-[popup-open]:bg-white/10 data-[popup-open]:text-white motion-reduce:transition-none"
        >
          <Ellipsis className="h-5 w-5" aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end" sideOffset={8} className="z-50 print:hidden">
            <Menu.Popup className="crystal-surface min-w-44 rounded-xl p-1.5 outline-hidden">
              <Menu.Item onClick={handleHistory} className={MENU_ITEM}>
                <History className="h-4 w-4 text-white/60" aria-hidden="true" />
                Historial
              </Menu.Item>
              <Menu.Item onClick={handlePrint} className={MENU_ITEM}>
                <Printer className="h-4 w-4 text-white/60" aria-hidden="true" />
                Imprimir
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
