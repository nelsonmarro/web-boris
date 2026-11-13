import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NotFoundCard } from '@/components/NotFoundCard';

export const metadata: Metadata = {
  title: 'Página no encontrada | Universos de BorisaoBlois',
  description: 'Esta página no existe. Vuelve al inicio, abre el Archivo o busca una ficha.',
};

/**
 * 404 de todo el sitio: se pinta dentro del layout raíz, así que lleva su propia cabecera y pie. El de una ficha
 * inexistente es `(wiki)/wiki/[slug]/not-found.tsx`, dentro del marco de la wiki.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#00122E]">
      <Navbar noActive />
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-10 pt-32">
        <NotFoundCard />
      </main>
      <Footer />
    </div>
  );
}
