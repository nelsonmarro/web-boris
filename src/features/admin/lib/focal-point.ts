/**
 * El encuadre de la portada (`imagePosition`, un `object-position` de CSS) como un punto en porcentajes. Puro.
 */
export interface FocalPoint {
  x: number;
  y: number;
}

const KEYWORDS: Record<string, { axis?: 'x' | 'y'; value: number }> = {
  left: { axis: 'x', value: 0 },
  right: { axis: 'x', value: 100 },
  top: { axis: 'y', value: 0 },
  bottom: { axis: 'y', value: 100 },
  center: { value: 50 },
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/** «50% 12%», «center top», «left», «30%»… → `{ x, y }`; `null` si no es un encuadre que se entienda. Vacío = centro. */
export function parsePosition(value: string): FocalPoint | null {
  const tokens = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { x: 50, y: 50 };
  if (tokens.length > 2) return null;
  const point: Partial<FocalPoint> = {};
  const loose: number[] = [];
  for (const token of tokens) {
    const percent = /^(-?\d+(?:\.\d+)?)%$/.exec(token);
    if (percent) {
      loose.push(Number(percent[1]));
      continue;
    }
    const keyword = KEYWORDS[token];
    if (!keyword) return null;
    if (keyword.axis) {
      if (point[keyword.axis] !== undefined) return null;
      point[keyword.axis] = keyword.value;
    } else loose.push(keyword.value);
  }
  // Los porcentajes y «center» van en orden: primero el horizontal, luego el vertical (salvo que el eje ya esté puesto).
  for (const value of loose) {
    if (point.x === undefined) point.x = value;
    else if (point.y === undefined) point.y = value;
    else return null;
  }
  return { x: clamp(point.x ?? 50), y: clamp(point.y ?? 50) };
}

/** `{ x: 50, y: 50 }` (el centro) es el valor por defecto: se guarda vacío. */
export const formatPosition = ({ x, y }: FocalPoint): string => (clamp(x) === 50 && clamp(y) === 50 ? '' : `${clamp(x)}% ${clamp(y)}%`);
