import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/features/admin/actions/session';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { UndoProvider } from '@/features/admin/components/UndoProvider';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <header className="border-b border-white/10 bg-[#061a2e]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/admin" className="text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Panel de la wiki
          </Link>
          <nav aria-label="Secciones del panel" className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/admin/fichas" className="text-white/80 underline-offset-4 hover:text-primary hover:underline">
              Fichas
            </Link>
            <Link href="/admin/imagenes" className="text-white/80 underline-offset-4 hover:text-primary hover:underline">
              Imágenes
            </Link>
            <Link href="/admin/contenido" className="text-white/80 underline-offset-4 hover:text-primary hover:underline">
              Contenido
            </Link>
            <Link href="/admin/ayuda" className="text-white/80 underline-offset-4 hover:text-primary hover:underline">
              Ayuda
            </Link>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-white/70">{admin.name ?? admin.email}</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                Ver la web<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 has-[[data-split]]:max-w-[120rem]">
        <UndoProvider>{children}</UndoProvider>
      </main>
    </>
  );
}
