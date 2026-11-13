import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SetupForm } from '@/features/admin/components/SetupForm';
import { requireAdminSession } from '@/features/admin/server/require-admin';
import { pendingTotp } from '@/features/admin/server/setup';

export const metadata: Metadata = { title: 'Configura tu cuenta' };

export default async function AdminSetupPage() {
  const admin = await requireAdminSession();
  if (admin.ready) redirect('/admin');
  const totp = await pendingTotp(admin.id);
  // Cuenta con el 2FA ya activado pero sesión abierta sin él: toca volver a entrar con el código.
  if (!totp) redirect('/admin/login');

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <div className="crystal-surface rounded-2xl p-6 @md:p-8">
        <h1 className="text-2xl font-bold text-white">Configura tu cuenta</h1>
        <p className="mt-2 mb-8 text-white/80">
          Hola{admin.name ? `, ${admin.name}` : ''}. Antes de entrar al panel, cambia la contraseña temporal por una tuya y
          activa la verificación en dos pasos. Solo se hace una vez.
        </p>
        <SetupForm secret={totp.secret} qrDataUrl={totp.qrDataUrl} />
      </div>
    </main>
  );
}
