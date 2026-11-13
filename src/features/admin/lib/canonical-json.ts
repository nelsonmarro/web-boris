/**
 * JSON con las claves de cada objeto ordenadas. Sirve para saber si dos valores son iguales sin depender del orden
 * en que llegaron sus claves: Postgres (`jsonb`) reordena las claves al guardar y los archivos traen otro orden. Puro.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    const record = item as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, record[key]]));
  });
}
