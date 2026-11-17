import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { ChangePasswordForm, RecoveryCodesForm } from '@/features/admin/components/AccountForms';

export const metadata: Metadata = { title: 'Mi cuenta' };

const CARD = 'space-y-4 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5 @2xl:p-6';

export default async function AccountPage() {
  const admin = await requireAdmin();
  const remaining = await prisma.adminRecoveryCode.count({ where: { userId: admin.id, usedAt: null } });
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Mi cuenta</h1>
        <p className="text-white/80">
          {admin.name ? `${admin.name} · ` : ''}
          {admin.email}
        </p>
      </div>

      <section aria-labelledby="contrasena" className={CARD}>
        <h2 id="contrasena" className="text-xl font-bold text-white">
          Cambiar la contraseña
        </h2>
        <ChangePasswordForm />
      </section>

      <section aria-labelledby="recuperacion" className={CARD}>
        <h2 id="recuperacion" className="text-xl font-bold text-white">
          Códigos de recuperación
        </h2>
        <RecoveryCodesForm remaining={remaining} />
      </section>

      <section aria-labelledby="sesiones" className={CARD}>
        <h2 id="sesiones" className="text-xl font-bold text-white">
          Sesiones
        </h2>
        <p className="text-white/80">
          <strong className="text-white">Cerrar sesión</strong> (arriba) cierra la sesión en todos los dispositivos donde hayas
          entrado, no solo en este. Úsalo si entraste desde un ordenador que no es tuyo.
        </p>
      </section>
    </div>
  );
}
