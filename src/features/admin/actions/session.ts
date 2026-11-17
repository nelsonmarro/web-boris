'use server';

import { AuthError, CredentialsSignin } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { TEMPORARY_EXPIRED, THROTTLED } from '../server/login';
import { signIn, signOut } from '@/core/auth/auth';
import { currentAdmin } from '../server/require-admin';
import { audit } from '../server/audit';

export interface LoginState {
  error?: string;
  /** El correo tecleado, para no tener que escribirlo otra vez tras un fallo. */
  email?: string;
}

/**
 * Entra al panel. Ante cualquier fallo el mensaje es el mismo: no revela si la cuenta existe ni qué dato falló. La
 * excepción es el freno por exceso de intentos, que lo dice para que no se siga insistiendo con los datos buenos.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  try {
    await signIn('credentials', { email: text('email'), password: text('password'), code: text('code'), redirectTo: '/admin' });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === THROTTLED) {
      return { email: text('email').slice(0, 254), error: 'Demasiados intentos fallidos seguidos. Por seguridad, espera 15 minutos y vuelve a intentarlo.' };
    }
    if (error instanceof CredentialsSignin && error.code === TEMPORARY_EXPIRED) {
      return { email: text('email').slice(0, 254), error: 'Tu contraseña temporal ha caducado (vale 72 horas). Pídele a Nelson una nueva.' };
    }
    if (error instanceof AuthError) {
      return { email: text('email').slice(0, 254), error: 'Datos incorrectos. Revisa el correo, la contraseña y el código. Tras varios intentos fallidos hay que esperar 15 minutos.' };
    }
    throw error; // la redirección de Next tras entrar
  }
  return {};
}

/**
 * Cierra la sesión de verdad: la sesión es un JWT, así que borrar la cookie no basta (una copia seguiría valiendo hasta
 * que caduca). Subir `sessionVersion` invalida esta y cualquier otra sesión abierta de la cuenta.
 */
export async function logoutAction(): Promise<void> {
  const admin = await currentAdmin();
  if (admin) {
    await prisma.user.update({ where: { id: admin.id }, data: { sessionVersion: { increment: 1 } } });
    await audit('logout', { userId: admin.id });
  }
  await signOut({ redirectTo: '/admin/login' });
}
