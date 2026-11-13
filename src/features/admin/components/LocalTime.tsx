'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `true` solo en el navegador, ya hidratado: el servidor no sabe la zona horaria de quien mira. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const STYLES = {
  long: { dateStyle: 'long', timeStyle: 'short' },
  short: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * Fecha y hora en la hora local de quien mira. En el servidor (y hasta hidratar) se pinta en UTC con la marca «UTC»,
 * para no mostrar nunca una hora equivocada sin decirlo.
 */
export function LocalTime({ iso, style = 'long' }: { iso: string; style?: keyof typeof STYLES }) {
  const client = useIsClient();
  const date = new Date(iso);
  const text = client
    ? new Intl.DateTimeFormat('es', STYLES[style]).format(date)
    : `${new Intl.DateTimeFormat('es', { ...STYLES[style], timeZone: 'UTC' }).format(date)} UTC`;
  return <time dateTime={iso}>{text}</time>;
}

/** El inicio de la semana de las votaciones (lunes 00:00 UTC) en la hora local, p. ej. «domingo a las 19:00». */
export function WeekStartLocal() {
  const client = useIsClient();
  if (!client) return null;
  // Un lunes cualquiera a las 00:00 UTC (no importa cuál: solo interesa el día de la semana y la hora locales).
  const monday = new Date(Date.UTC(2026, 0, 5));
  const local = new Intl.DateTimeFormat('es', { weekday: 'long', hour: '2-digit', minute: '2-digit' }).formatToParts(monday);
  const part = (type: Intl.DateTimeFormatPartTypes) => local.find((item) => item.type === type)?.value ?? '';
  if (monday.getTimezoneOffset() === 0) return null;
  return (
    <>
      {' '}
      (en tu hora: el {part('weekday')} a las {part('hour')}:{part('minute')})
    </>
  );
}
