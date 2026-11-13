'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { hashPassword, passwordProblem, verifyPassword } from '../lib/password';
import { verifyTotp } from '../lib/totp';
import { open } from '../lib/secret-box';
import { generateRecoveryCodes, hashRecoveryCode } from '../lib/recovery-codes';
import { adminSecret } from '../server/app-secret';
import { audit } from '../server/audit';
import { requireAdminSession } from '../server/require-admin';

export interface SetupState {
  error?: string;
  /** Códigos de recuperación recién creados: se muestran una sola vez. */
  recoveryCodes?: string[];
}

/** Configuración inicial de la cuenta: contraseña propia + alta del 2FA. Invalida la sesión con la contraseña temporal. */
export async function completeSetupAction(_previous: SetupState, formData: FormData): Promise<SetupState> {
  const admin = await requireAdminSession();
  const appSecret = adminSecret();
  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!user || !appSecret) redirect('/admin/login');
  if (user.totpEnabledAt) redirect('/admin');

  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  const password = text('password');
  const repeat = text('repeat');
  const code = text('code');

  const problem = passwordProblem(password, admin.email);
  if (problem) return { error: problem };
  if (password !== repeat) return { error: 'Las dos contraseñas no coinciden.' };
  if (user.passwordHash && (await verifyPassword(password, user.passwordHash))) {
    return { error: 'Elige una contraseña distinta de la temporal.' };
  }

  const totpSecret = user.totpSecret ? open(user.totpSecret, appSecret, 'totp') : null;
  const step = totpSecret ? verifyTotp(totpSecret, code, Date.now(), user.totpLastStep) : null;
  if (step === null) {
    await audit('setup.fail', { userId: user.id });
    return { error: 'El código de 6 dígitos no es correcto. Comprueba que la app muestra el de «Wiki BorisaoBlois» y que no ha caducado.' };
  }

  const recoveryCodes = generateRecoveryCodes();
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, totpEnabledAt: new Date(), totpLastStep: step, sessionVersion: { increment: 1 } },
    }),
    prisma.adminRecoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.adminRecoveryCode.createMany({ data: recoveryCodes.map((item) => ({ userId: user.id, codeHash: hashRecoveryCode(item, appSecret) })) }),
  ]);
  await audit('setup.ok', { userId: user.id });
  return { recoveryCodes };
}
