import { FIELD, HINT, LABEL } from './field-styles';

/** Bloque del editor con su título; en rojo si alguno de sus campos tiene un error de publicar. */
export function Section({ title, children, invalid }: { title: string; children: React.ReactNode; invalid?: boolean }) {
  return (
    <section className={`space-y-4 rounded-2xl border bg-[#061a2e]/60 p-4 @2xl:p-6 ${invalid ? 'border-red-400/60' : 'border-white/10'}`}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

/** Campo de texto del editor: una línea, varias (`multiline`) o numérico con su rango (`range`). */
export function TextField(props: {
  id?: string;
  invalid?: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric' | 'text';
  /** Campo numérico con su rango (`type="number"`): el navegador no deja salirse de él con las flechas. */
  range?: { min: number; max?: number; step: number };
}) {
  const { id, invalid, label, value, onChange, hint, multiline, maxLength = 500, placeholder, inputMode, range } = props;
  const common = { id, value, maxLength, placeholder, 'aria-invalid': invalid || undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  const border = invalid ? 'border-red-400' : '';
  return (
    <label className="block space-y-1">
      <span className={LABEL}>{label}</span>
      {multiline ? (
        <textarea className={`${FIELD} min-h-24 ${border}`} {...common} />
      ) : range ? (
        <input className={`${FIELD} ${border}`} type="number" inputMode={range.step < 1 ? 'decimal' : 'numeric'} min={range.min} max={range.max} step={range.step} {...common} maxLength={undefined} />
      ) : (
        <input className={`${FIELD} ${border}`} inputMode={inputMode} {...common} />
      )}
      {hint ? <span className={`block ${HINT}`}>{hint}</span> : null}
    </label>
  );
}
