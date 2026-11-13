import type { InputHTMLAttributes, ReactNode } from 'react';

interface AdminFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

/** Campo del panel: etiqueta visible, ayuda opcional y superficie sólida bajo el texto. */
export function AdminField({ label, hint, id, name, ...props }: AdminFieldProps) {
  const fieldId = id ?? `campo-${name}`;
  const hintId = hint ? `${fieldId}-ayuda` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-bold text-white">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-describedby={hintId}
        className="h-12 w-full rounded-xl border border-white/20 bg-[#061a2e] px-4 text-base text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-white/70">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
