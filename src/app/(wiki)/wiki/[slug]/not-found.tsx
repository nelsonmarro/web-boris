import { NotFoundCard } from '@/components/NotFoundCard';

/** 404 de una ficha que no existe. Va dentro del layout de la wiki (menú, cabecera y pie), así que solo pinta la tarjeta. */
export default function WikiArticleNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <NotFoundCard />
    </div>
  );
}
