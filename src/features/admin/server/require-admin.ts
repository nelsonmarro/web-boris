import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth/auth';
import { prisma } from '@/lib/prisma';
import { ADMIN_ROLE } from './login';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  /** La cuenta ya tiene contraseña propia y 2FA activado, y esta sesión entró con el segundo factor. */
  ready: boolean;
}

/**
 * La cuenta de la sesión, contrastada con la base en cada petición: debe seguir siendo administradora y la sesión no
 * puede ser anterior al último cambio de contraseña o de 2FA (`sessionVersion`). `null` si no hay sesión válida.
 */
export const currentAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  const claims = session?.user;
  if (!claims?.id || claims.role !== ADMIN_ROLE) return null;
  const user = await prisma.user.findUnique({
    where: { id: claims.id },
    select: { id: true, email: true, name: true, role: true, sessionVersion: true, totpEnabledAt: true },
  });
  if (!user?.email || user.role !== ADMIN_ROLE || user.sessionVersion !== claims.sessionVersion) return null;
  return { id: user.id, email: user.email, name: user.name, ready: !!user.totpEnabledAt && claims.mfa === true };
});

/**
 * Puerta de **cada** página y de **cada** server action del panel (el proxy solo redirige, no protege). Sin sesión
 * válida manda al acceso; con la cuenta a medio configurar, a `/admin/configurar`.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  if (!admin.ready) redirect('/admin/configurar');
  return admin;
}

/** Puerta de la pantalla de configuración inicial: sesión válida, con o sin 2FA. */
export async function requireAdminSession(): Promise<AdminUser> {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
