const fechaFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Fecha larga en español («13 de diciembre de 2025»), en UTC para que no dependa de la zona del servidor. */
export const formatFecha = (date: Date) => fechaFormat.format(date);
