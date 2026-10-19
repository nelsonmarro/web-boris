import type { SectionCompleteness } from '@/core/search/section-completeness';

/**
 * Medidor de apartados de una ficha que no está sellada pero tiene apartados «Próximamente».
 * Solo se muestra con al menos 2 apartados y 1 pendiente; las fichas completas no lo llevan.
 */
export function ArchivoMeter({ done, total, pending }: SectionCompleteness) {
  if (total < 2 || pending.length < 1) return null;
  const labelId = 'archivo-meter-label';

  return (
    <div className="not-prose mb-8 max-w-md">
      <p id={labelId} className="text-[13px] font-bold text-white/85">
        Archivo · {done} de {total} apartados desclasificados
      </p>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${total} apartados desclasificados`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((done / total) * 100)}%` }} />
      </div>
      <p className="mt-2 text-[13px] leading-snug text-white/70">Pendiente: {pending.join(', ')}</p>
    </div>
  );
}
