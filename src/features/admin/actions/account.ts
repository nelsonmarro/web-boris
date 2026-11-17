'use server';

import { signOut } from '@/core/auth/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, passwordProblem, verifyPassword } from '../lib/password';
import { generateRecoveryCodes, hashRecoveryCode, looksLikeRecoveryCode } from '../lib/recovery-codes';
import { WINDOW_MINUTES } from '../lib/lockout';
import { adminSecret } from '../server/app-secret';
import { audit } from '../server/audit';
import { consumeSecondFactor } from '../server/login';
import { requireAdmin } from '../server/require-admin';

export interface AccountState {
  error?: string;
  /** Códigos de recuperación nuevos: se muestran una sola vez. */
  recoveryCodes?: string[];
}

/** Fallos seguidos en «Mi cuenta» (contraseña actual o código) que frenan durante `WINDOW_MINUTES`. */
const MAX_ACCOUNT_FAILURES = 5;

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
};

async function throttled(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  return (await prisma.adminAuditLog.count({ where: { action: 'account.fail', userId, createdAt: { gte: since } } })) >= MAX_ACCOUNT_FAILURES;
}

const THROTTLED_MESSAGE = 'Demasiados intentos fallidos seguidos. Espera 15 minutos y vuelve a intentarlo.';
const CODE_MESSAGE = 'El código de 6 dígitos no es correcto. Escribe el que muestra ahora la app «Wiki BorisaoBlois».';

/**
 * Cambia la contraseña. Pide la actual y el código de la app (con una sesión abierta en un ordenador ajeno no basta).
 * Cierra todas las sesiones, también esta: hay que volver a entrar con la contraseña nueva.
 */
export async function changePasswordAction(_previous: AccountState, formData: FormData): Promise<AccountState> {
  const admin = await requireAdmin();
  const secret = adminSecret();
  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!secret || !user?.passwordHash) return { error: 'No se pudo cambiar la contraseña. Inténtalo más tarde.' };
  if (await throttled(user.id)) return { error: THROTTLED_MESSAGE };

  const current = text(formData, 'current');
  const password = text(formData, 'password');
  const code = text(formData, 'code').trim();
  const problem = passwordProblem(password, admin.email);
  if (problem) return { error: problem };
  if (password !== text(formData, 'repeat')) return { error: 'Las dos contraseñas nuevas no coinciden.' };
  if (!(await verifyPassword(current, user.passwordHash))) {
    await audit('account.fail', { userId: user.id, target: 'contraseña actual' });
    return { error: 'La contraseña actual no es correcta.' };
  }
  if (await verifyPassword(password, user.passwordHash)) return { error: 'La contraseña nueva es igual a la actual.' };
  if (looksLikeRecoveryCode(code) || !(await consumeSecondFactor(user, code, secret))) {
    await audit('account.fail', { userId: user.id, target: 'código' });
    return { error: CODE_MESSAGE };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), temporaryPasswordUntil: null, sessionVersion: { increment: 1 } },
  });
  await audit('account.password', { userId: user.id });
  await signOut({ redirectTo: '/admin/login?aviso=contrasena' });
  return {};
}

/** Sustituye los códigos de recuperación por diez nuevos (los anteriores dejan de valer). Pide el código de la app. */
export async function regenerateRecoveryCodesAction(_previous: AccountState, formData: FormData): Promise<AccountState> {
  const admin = await requireAdmin();
  const secret = adminSecret();
  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!secret || !user) return { error: 'No se pudieron crear los códigos. Inténtalo más tarde.' };
  if (await throttled(user.id)) return { error: THROTTLED_MESSAGE };

  const code = text(formData, 'code').trim();
  if (looksLikeRecoveryCode(code) || !(await consumeSecondFactor(user, code, secret))) {
    await audit('account.fail', { userId: user.id, target: 'código' });
    return { error: CODE_MESSAGE };
  }
  const recoveryCodes = generateRecoveryCodes();
  await prisma.$transaction([
    prisma.adminRecoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.adminRecoveryCode.createMany({ data: recoveryCodes.map((item) => ({ userId: user.id, codeHash: hashRecoveryCode(item, secret) })) }),
  ]);
  await audit('account.recovery', { userId: user.id });
  return { recoveryCodes };
}
