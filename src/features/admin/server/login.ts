import 'server-only';
import { prisma } from '@/lib/prisma';
import { hmac, networkOf } from '@/features/community/lib/voter';
import { burnPasswordTime, verifyPassword, PASSWORD_MAX_LENGTH } from '../lib/password';
import { verifyTotp } from '../lib/totp';
import { open } from '../lib/secret-box';
import { hashRecoveryCode, looksLikeRecoveryCode } from '../lib/recovery-codes';
import { isThrottled, WINDOW_MINUTES } from '../lib/lockout';
import { createSlots } from '../lib/slots';
import { readHandoff } from '../lib/setup-handoff';
import { adminSecret } from './app-secret';
import { audit } from './audit';

export const ADMIN_ROLE = 'admin';

export interface AdminLogin {
  id: string;
  email: string;
  name: string | null;
  sessionVersion: number;
  /** `true` si entró con el segundo factor; `false` mientras la cuenta aún no lo tiene activado (solo puede configurarla). */
  mfa: boolean;
}

/** Hash de la red de quien intenta entrar (nunca la IP). */
export const loginNetworkHash = (secret: string, ip: string): string => hmac(secret, `admin-login|${networkOf(ip)}`);

/** Como mucho dos hashes de contraseña a la vez (~130 MB cada uno) y 20 en cola: una ráfaga de intentos no agota la memoria. */
const hashSlot = createSlots(2, 20);

/** ¿Vale `code` como segundo factor? Consume el código (paso TOTP o código de recuperación) para que no sirva otra vez. */
async function consumeSecondFactor(user: { id: string; totpSecret: string | null; totpLastStep: number }, code: string, secret: string): Promise<boolean> {
  if (looksLikeRecoveryCode(code)) {
    const used = await prisma.adminRecoveryCode.updateMany({
      where: { userId: user.id, codeHash: hashRecoveryCode(code, secret), usedAt: null },
      data: { usedAt: new Date() },
    });
    return used.count === 1;
  }
  const totpSecret = user.totpSecret ? open(user.totpSecret, secret, 'totp') : null;
  if (!totpSecret) return false;
  const step = verifyTotp(totpSecret, code, Date.now(), user.totpLastStep);
  if (step === null) return false;
  // Solo gana una de dos peticiones simultáneas con el mismo código.
  const claimed = await prisma.user.updateMany({ where: { id: user.id, totpLastStep: { lt: step } }, data: { totpLastStep: step } });
  return claimed.count === 1;
}

/**
 * Comprueba correo + contraseña + segundo factor. Devuelve la cuenta o `null`, sin decir nunca qué falló: por fuera,
 * una cuenta que no existe, una frenada y una contraseña mala son indistinguibles (también en el tiempo de respuesta).
 */
export async function authenticateAdmin(input: { email: string; password: string; code: string }, ip: string): Promise<AdminLogin | null> {
  const secret = adminSecret();
  if (!secret) {
    console.error('[admin:login] AUTH_SECRET ausente o corto: el acceso al panel está cerrado.');
    return null;
  }
  const email = input.email.trim().toLowerCase();
  const { password } = input;
  const code = input.code.trim();
  const ipHash = loginNetworkHash(secret, ip);
  if (!email || email.length > 254 || !password || password.length > PASSWORD_MAX_LENGTH || code.length > 32) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  const account = user && user.role === ADMIN_ROLE && user.passwordHash ? { ...user, passwordHash: user.passwordHash } : null;
  const fail = async (reason: string): Promise<null> => {
    await audit('login.fail', { userId: account?.id, ipHash, target: `${email} (${reason})` });
    return null;
  };

  const failures = { action: 'login.fail', createdAt: { gte: new Date(Date.now() - WINDOW_MINUTES * 60_000) } };
  const [network, accountAndNetwork, accountTotal] = await Promise.all([
    prisma.adminAuditLog.count({ where: { ...failures, ipHash } }),
    account ? prisma.adminAuditLog.count({ where: { ...failures, ipHash, userId: account.id } }) : 0,
    account ? prisma.adminAuditLog.count({ where: { ...failures, userId: account.id } }) : 0,
  ]);
  if (isThrottled({ network, accountAndNetwork, account: accountTotal })) {
    // No se apunta como fallo: si contara, el freno no caducaría nunca mientras alguien siguiera insistiendo.
    await audit('login.throttled', { userId: account?.id, ipHash, target: email });
    return null;
  }

  // Siempre se hace el trabajo del hash, exista o no la cuenta: el tiempo de respuesta no la delata.
  const passwordOk = await hashSlot(async () => {
    if (!account) {
      await burnPasswordTime(password);
      return false;
    }
    return verifyPassword(password, account.passwordHash);
  });
  if (passwordOk === null) return fail('saturado');
  if (!account) return fail('cuenta');
  if (!passwordOk) return fail('contraseña');

  const mfa = !!account.totpEnabledAt;
  if (mfa && !(await consumeSecondFactor(account, code, secret))) return fail('código');

  await audit('login.ok', { userId: account.id, ipHash, target: mfa ? undefined : 'sin 2FA: pendiente de configurar' });
  return { id: account.id, email, name: account.name, sessionVersion: account.sessionVersion, mfa };
}

/**
 * Entrada justo después de configurar la cuenta (auditoría #17): vale el pase que crea la acción de configuración
 * (`createHandoff`), si la cuenta sigue siendo administradora, ya tiene el 2FA activo y no ha cambiado su
 * `sessionVersion` desde entonces. La configuración acaba de comprobar la contraseña nueva y un código TOTP.
 */
export async function completeSetupLogin(token: string): Promise<AdminLogin | null> {
  const secret = adminSecret();
  if (!secret) return null;
  const handoff = readHandoff(secret, token, Date.now());
  if (!handoff) return null;
  const user = await prisma.user.findUnique({ where: { id: handoff.userId } });
  if (!user?.email || user.role !== ADMIN_ROLE || !user.totpEnabledAt || user.sessionVersion !== handoff.sessionVersion) return null;
  // Un solo uso: gastarlo sube la versión (el pase deja de coincidir). De dos peticiones a la vez, solo gana una.
  const claimed = await prisma.user.updateMany({ where: { id: user.id, sessionVersion: handoff.sessionVersion }, data: { sessionVersion: { increment: 1 } } });
  if (claimed.count !== 1) return null;
  await audit('login.ok', { userId: user.id, target: 'tras configurar la cuenta' });
  return { id: user.id, email: user.email, name: user.name, sessionVersion: handoff.sessionVersion + 1, mfa: true };
}
