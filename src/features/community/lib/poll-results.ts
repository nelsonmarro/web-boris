/** Recuento de una encuesta → porcentajes enteros que suman 100 (método del mayor resto). Puro. */
export interface PollTally {
  totals: Record<string, number>;
  percents: Record<string, number>;
  total: number;
}

export function computeTally(options: readonly string[], counts: Readonly<Record<string, number>>): PollTally {
  const totals: Record<string, number> = {};
  for (const o of options) totals[o] = Math.max(0, Math.floor(counts[o] ?? 0));
  const total = options.reduce((sum, o) => sum + totals[o], 0);

  const percents: Record<string, number> = {};
  if (total === 0) {
    for (const o of options) percents[o] = 0;
    return { totals, percents, total };
  }

  const exact = options.map((o) => ({ o, value: (totals[o] * 100) / total }));
  for (const { o, value } of exact) percents[o] = Math.floor(value);
  let remaining = 100 - options.reduce((sum, o) => sum + percents[o], 0);
  const byRemainder = [...exact].sort((x, y) => (y.value % 1) - (x.value % 1) || x.o.localeCompare(y.o));
  for (const { o } of byRemainder) {
    if (remaining <= 0) break;
    percents[o] += 1;
    remaining -= 1;
  }
  return { totals, percents, total };
}
