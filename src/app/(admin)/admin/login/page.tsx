import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/admin/components/LoginForm';
import { currentAdmin } from '@/features/admin/server/require-admin';

export const metadata: Metadata = { title: 'Entrar' };

export default async function AdminLoginPage() {
  const admin = await currentAdmin();
  if (admin) redirect(admin.ready ? '/admin' : '/admin/configurar');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="crystal-surface rounded-2xl p-6 @md:p-8">
        <h1 className="text-2xl font-bold text-white">Panel de la wiki</h1>
        <p className="mt-2 mb-8 text-white/80">Acceso reservado al equipo de BorisaoBlois.</p>
        <LoginForm />
      </div>
    </main>
  );
}
