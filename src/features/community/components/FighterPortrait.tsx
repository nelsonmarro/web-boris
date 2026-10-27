import Image from 'next/image';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, coverOf } from '@/components/content/CategoryPlaceholder';

export interface PollFighter {
  slug: string;
  title: string;
  image?: string;
  imagePosition?: string;
  category?: string;
  /** `proximamente`: la ficha sigue sellada; si Boris ya la desclasificó viene sin estado. */
  status?: string;
}

/**
 * Retrato cuadrado de una ficha en la encuesta y en el historial de /comunidad. `pending`: la ficha aún no está
 * desclasificada; el retrato va apagado (en gris), como las tarjetas «Próximamente». `className` ajusta el tamaño
 * (p. ej. `w-12 rounded-xl` en las listas; `cn` resuelve el conflicto con `w-full`/`rounded-2xl`).
 */
export function FighterPortrait({
  fighter,
  pending = false,
  sizes = '(min-width: 768px) 300px, 40vw',
  className,
  eager = false,
}: {
  fighter: PollFighter;
  pending?: boolean;
  sizes?: string;
  className?: string;
  /** `loading="eager"`: solo para los retratos de la encuesta vigente, cerca del primer pliegue. */
  eager?: boolean;
}) {
  const cover = coverOf(fighter.image);
  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]',
        pending && 'grayscale opacity-70',
        className,
      )}
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? 'eager' : undefined}
          className="object-cover"
          style={{ objectPosition: fighter.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <CategoryPlaceholder category={fighter.category} className="[&_span]:hidden" />
      )}
    </div>
  );
}
