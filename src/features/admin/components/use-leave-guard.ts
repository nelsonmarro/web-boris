'use client';

import { useEffect } from 'react';
import { DISCARDS_EDITS, leavesPage } from '../lib/leave-guard';

/**
 * Mientras `dirty`, pide confirmación con `message` antes de perder los cambios: al cerrar o recargar la pestaña
 * (`beforeunload`, con el aviso del navegador), al pulsar un enlace que saca de la página y al enviar un formulario
 * marcado con `discardsEdits` (retirar la ficha, recuperar una versión, cerrar sesión). Escucha en `window` en fase de
 * captura: corre antes que React, así que cancelar ahí impide también la navegación de `<Link>` y la acción del
 * formulario. «Atrás» del navegador dentro de la app no se puede frenar.
 */
export function useLeaveGuard(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;
    // Tras aceptar salir por un enlace normal (sin `<Link>`), el navegador no debe volver a preguntar.
    let confirmed = false;
    const cancel = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const ask = (event: Event) => {
      if (window.confirm(message)) confirmed = true;
      else cancel(event);
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!confirmed) event.preventDefault();
    };
    const onClick = (event: MouseEvent) => {
      // Con una tecla o la rueda, el navegador lo abre en otra pestaña: no se sale.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if (leavesPage({ href: link.href, target: link.target, download: link.hasAttribute('download') }, window.location.href)) ask(event);
    };
    const onSubmit = (event: SubmitEvent) => {
      if (event.target instanceof HTMLFormElement && event.target.hasAttribute(DISCARDS_EDITS)) ask(event);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('click', onClick, true);
    window.addEventListener('submit', onSubmit, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('submit', onSubmit, true);
    };
  }, [dirty, message]);
}
