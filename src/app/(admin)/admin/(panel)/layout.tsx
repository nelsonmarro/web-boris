import { logoutAction } from '@/features/admin/actions/session';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { UndoProvider } from '@/features/admin/components/UndoProvider';
import { PanelHeader } from '@/features/admin/components/PanelHeader';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <PanelHeader account={admin.name ?? admin.email} logout={logoutAction} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 has-[[data-split]]:max-w-[120rem] md:py-10">
        <UndoProvider>{children}</UndoProvider>
      </main>
    </>
  );
}
