/** Freno a la fuerza bruta del acceso al panel (spec CMS §4.2). Puro. */

/** Ventana en la que se cuentan los fallos. */
export const WINDOW_MINUTES = 15;
/**
 * Fallos de una misma red contra una misma cuenta. El bloqueo no es de la cuenta entera a propósito: el correo de
 * Boris es público y, si lo fuera, cualquiera podría dejarlo fuera del panel con cinco intentos cada cuarto de hora.
 */
export const MAX_FAILURES_PER_ACCOUNT_AND_NETWORK = 8;
/**
 * Fallos contra una cuenta desde cualquier red: acota el ataque repartido entre muchas redes. No se aplica a las redes
 * desde las que esa cuenta ya entró (`trustedNetwork`): si no, con unas pocas redes cualquiera dejaría fuera a Boris.
 */
export const MAX_FAILURES_PER_ACCOUNT = 40;
/** Días durante los que una red desde la que la cuenta entró bien sigue siendo «de confianza». */
export const TRUSTED_NETWORK_DAYS = 30;
/** Fallos de una red contra cualquier cuenta, exista o no. */
export const MAX_FAILURES_PER_NETWORK = 20;

export interface FailureCounts {
  /** De esta red, contra cualquier cuenta. */
  network: number;
  /** De esta red contra esta cuenta (0 si la cuenta no existe). */
  accountAndNetwork: number;
  /** Contra esta cuenta desde cualquier red (0 si la cuenta no existe). */
  account: number;
  /** La cuenta entró bien desde esta red en los últimos `TRUSTED_NETWORK_DAYS` días. */
  trustedNetwork?: boolean;
}

/** ¿Hay que rechazar el intento sin comprobar nada, por exceso de fallos recientes? */
export const isThrottled = (counts: FailureCounts): boolean =>
  counts.network >= MAX_FAILURES_PER_NETWORK ||
  counts.accountAndNetwork >= MAX_FAILURES_PER_ACCOUNT_AND_NETWORK ||
  (!counts.trustedNetwork && counts.account >= MAX_FAILURES_PER_ACCOUNT);
