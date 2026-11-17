/** Contraseña temporal de `admin:create`: solo sirve para configurar la cuenta y caduca. Puro. */

/** Horas que vale la contraseña temporal: da tiempo a quedar con Boris, pero una filtrada no sirve para siempre. */
export const TEMPORARY_PASSWORD_HOURS = 72;

export const temporaryPasswordUntil = (now: Date): Date => new Date(now.getTime() + TEMPORARY_PASSWORD_HOURS * 3_600_000);

/** ¿Ha caducado? Solo cuenta para cuentas sin configurar (sin 2FA); `null` no caduca. */
export const temporaryPasswordExpired = (account: { totpEnabledAt: Date | null; temporaryPasswordUntil: Date | null }, now: Date): boolean =>
  !account.totpEnabledAt && account.temporaryPasswordUntil !== null && now.getTime() > account.temporaryPasswordUntil.getTime();
