/**
 * Recorridos guiados del panel para Boris (driver.js, issue #112). Solo datos y reglas: los pinta `PanelTour`. Cada paso
 * señala un elemento con `data-tour="<target>"` (un test comprueba que existe en su página) o ninguno (un aviso centrado).
 * Los textos van sin HTML: driver.js los mete como `innerHTML` y aquí solo hay texto fijo. Puro.
 */

export interface TourStep {
  /** Valor de `data-tour` del elemento que se resalta; sin él, el paso sale centrado en la pantalla. */
  target?: string;
  title: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface Tour {
  id: string;
  /** Súbela al cambiar el recorrido a fondo: quien ya lo vio lo verá de nuevo una vez. */
  version: number;
  steps: readonly TourStep[];
}

export const tourSelector = (target: string) => `[data-tour="${target}"]`;

/** Clave de `localStorage` que recuerda que ya se vio (y no hay que lanzarlo solo otra vez). */
export const tourSeenKey = (tour: Pick<Tour, 'id' | 'version'>) => `wb-panel-tour:${tour.id}:v${tour.version}`;

/** Los pasos que se pueden mostrar ahora: los centrados y los que tienen su elemento en la página. */
export function presentSteps(steps: readonly TourStep[], exists: (target: string) => boolean): TourStep[] {
  return steps.filter((step) => !step.target || exists(step.target));
}

/** Textos de los botones y del progreso, en español. */
export const TOUR_LABELS = {
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Terminar',
  closeBtnLabel: 'Cerrar el recorrido',
  progressText: '{{current}} de {{total}}',
} as const;

/** Recorrido del editor de una ficha (`/admin/fichas/<ficha>`). */
export const EDITOR_TOUR: Tour = {
  id: 'editor-ficha',
  version: 1,
  steps: [
    {
      title: 'Así se edita una ficha',
      description: 'Te enseño cada parte en un minuto. Pasa con «Siguiente» o con las flechas del teclado y sal cuando quieras con Esc. Puedes volver a verlo con «Ver el recorrido».',
    },
    {
      target: 'barra',
      side: 'bottom',
      title: 'Guardar y publicar',
      description: 'Esta barra te acompaña al bajar por la ficha. «Guardar borrador» (o Ctrl + S) guarda sin que se vea en la web. «Publicar» la saca en la web en unos segundos. A la izquierda ves si tienes cambios sin guardar.',
    },
    {
      target: 'acciones',
      side: 'bottom',
      title: 'Nota y vista previa',
      description: 'La nota (opcional) dice qué cambiaste y sale en el historial. «Vista previa» abre la ficha en otra pestaña con lo que hay ahora, aunque no lo hayas guardado. En una pantalla grande, «Vista previa al lado» la muestra junto al editor y se actualiza sola.',
    },
    {
      target: 'datos',
      title: 'Datos básicos',
      description: 'El nombre, el universo, la categoría y la descripción corta que sale en los listados y al compartir el enlace. Aquí está también «Expediente sellado»: desmárcalo cuando quieras desclasificar la ficha.',
    },
    {
      target: 'portada',
      title: 'La portada',
      description: 'Elige una imagen de la web o sube una nueva y describe qué se ve. Después pulsa sobre ella la parte que siempre debe verse: el panel te enseña cómo queda recortada en cada pantalla.',
    },
    {
      target: 'ficha-lateral',
      title: 'La ficha lateral',
      description: 'Los datos que salen junto al texto en la web, agrupados en secciones con sus pares de nombre y valor.',
    },
    {
      target: 'texto',
      title: 'El texto, por apartados',
      description: 'Cada apartado («Características», «Comportamiento»…) es una tarjeta con sus bloques: texto, imágenes, citas, avisos… Añádelos con «Añadir texto, imagen, cita…» al final de cada apartado. Si de un apartado aún no quieres contar nada, márcalo como Próximamente.',
    },
    {
      target: 'relacionadas',
      title: 'Apodos y fichas relacionadas',
      description: 'Con los apodos la búsqueda encuentra la ficha por otros nombres. Las relacionadas salen al final de la ficha, en el orden que elijas.',
    },
    {
      target: 'arena',
      title: 'Datos de la Arena',
      description: 'Opcionales. Con ellos la criatura puede combatir en la Arena y entrar en los duelos de la votación semanal.',
    },
    {
      target: 'historial',
      title: 'Historial',
      description: 'Cada vez que publicas queda una versión. «Recuperar en el borrador» trae una anterior para revisarla; no se publica sola.',
    },
    {
      target: 'retirar',
      side: 'top',
      title: 'Retirar de la web',
      description: 'Oculta la ficha de la web sin borrar nada. Puedes volver a mostrarla cuando quieras.',
    },
    {
      title: 'Listo',
      description: 'Si quitas algo sin querer, abajo aparece «Deshacer» durante unos segundos, y si vas a salir con cambios sin guardar, el panel te avisa. Tienes la guía completa en «Ayuda».',
    },
  ],
};

/** Los recorridos por su id (un test exige que la clave sea el `id`). */
export const TOURS = { 'editor-ficha': EDITOR_TOUR } satisfies Record<string, Tour>;
export type TourId = keyof typeof TOURS;
