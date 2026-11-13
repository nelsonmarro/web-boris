'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/core/auth/auth';
import { currentAdmin } from '../server/require-admin';
import { audit } from '../server/audit';

export interface LoginState {
  error?: string;
  /** El correo tecleado, para no tener que escribirlo otra vez tras un fallo. */
  email?: string;
}

/** Entra al panel. Ante cualquier fallo el mensaje es el mismo: no revela si la cuenta existe ni qué dato falló. */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  try {
    await signIn('credentials', { email: text('email'), password: text('password'), code: text('code'), redirectTo: '/admin' });
  } catch (error) {
    if (error instanceof AuthError) {
      return { email: text('email').slice(0, 254), error: 'Datos incorrectos. Revisa el correo, la contraseña y el código. Tras varios intentos fallidos hay que esperar 15 minutos.' };
    }
    throw error; // la redirección de Next tras entrar
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  const admin = await currentAdmin();
  if (admin) await audit('logout', { userId: admin.id });
  await signOut({ redirectTo: '/admin/login' });
}
