/**
 * Rangos del registro (spec UX fase 2 §5). Puramente cosmético: no bloquea nada.
 * Porcentajes sobre el total de expedientes que cuentan; cada rango exige al menos un expediente más
 * que el anterior, aunque el total sea pequeño.
 */

export interface Rango {
  id:
    | "civil"
    | "recluta"
    | "operativo"
    | "analista"
    | "investigador-jefe"
    | "acceso-total";
  nombre: string;
}

export interface RangoDeRegistro {
  actual: Rango;
  /** `null` en el último rango, o si no hay expedientes que contar. */
  siguiente: { nombre: string; faltan: number } | null;
}

const CIVIL: Rango = { id: "civil", nombre: "Civil" };

/** Rangos por encima de Civil: `pct` es el porcentaje mínimo del total (Recluta: basta 1 expediente). */
const ESCALA: ReadonlyArray<Rango & { pct: number }> = [
  { id: "recluta", nombre: "Recluta", pct: 0 },
  { id: "operativo", nombre: "Operativo", pct: 25 },
  { id: "analista", nombre: "Analista", pct: 50 },
  { id: "investigador-jefe", nombre: "Investigador jefe", pct: 80 },
  { id: "acceso-total", nombre: "Acceso total", pct: 100 },
];

/** Expedientes necesarios para cada rango de `ESCALA`, estrictamente crecientes y sin pasar de `total`. */
function umbrales(total: number): number[] {
  const out: number[] = [];
  let previo = 0;
  ESCALA.forEach((r, i) => {
    const bruto = Math.max(1, Math.ceil((total * r.pct) / 100));
    // Hueco para los rangos que quedan por llegar a `total`.
    const tope = total - (ESCALA.length - 1 - i);
    const need =
      i === ESCALA.length - 1
        ? total
        : Math.min(Math.max(bruto, previo + 1), Math.max(tope, previo + 1));
    out.push(need);
    previo = need;
  });
  return out;
}

export function rangoDeRegistro(
  opened: number,
  total: number,
): RangoDeRegistro {
  const t = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const o = Number.isFinite(opened)
    ? Math.min(Math.max(0, Math.floor(opened)), t)
    : 0;
  if (t === 0 || o === 0) {
    return {
      actual: CIVIL,
      siguiente: t === 0 ? null : { nombre: ESCALA[0].nombre, faltan: 1 },
    };
  }
  const need = umbrales(t);
  let idx = -1;
  need.forEach((n, i) => {
    if (o >= n) idx = i;
  });
  const { pct: _pct, ...actual } = ESCALA[idx];
  void _pct;
  const next = ESCALA[idx + 1];
  return {
    actual,
    siguiente: next ? { nombre: next.nombre, faltan: need[idx + 1] - o } : null,
  };
}
