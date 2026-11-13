import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoWeekKey, isoWeekNumber } from '../../src/core/content/iso-week.ts';

test('isoWeekNumber es el número de isoWeekKey, en UTC', () => {
  assert.equal(isoWeekNumber(new Date('2026-10-18T12:00:00Z')), 42); // domingo
  // Domingo 23:30 en Ecuador (UTC-5) ya es lunes en UTC: semana 43, igual que la encuesta.
  assert.equal(isoWeekNumber(new Date('2026-10-19T04:30:00Z')), 43);
  assert.equal(isoWeekNumber(new Date('2027-01-01T00:00:00Z')), 53);
  for (const iso of ['2026-01-01T00:00:00Z', '2026-06-15T10:00:00Z', '2027-01-04T00:00:00Z']) {
    const date = new Date(iso);
    assert.equal(isoWeekNumber(date), Number(isoWeekKey(date).slice(-2)), iso);
  }
});

test('addWeeks: avanza y retrocede semanas, también al cambiar de año (2026 tiene 53 semanas)', async () => {
  const { addWeeks } = await import('../../src/core/content/iso-week.ts');
  assert.equal(addWeeks('2026-W46', 1), '2026-W47');
  assert.equal(addWeeks('2026-W52', 1), '2026-W53');
  assert.equal(addWeeks('2026-W53', 1), '2027-W01');
  assert.equal(addWeeks('2027-W01', -1), '2026-W53');
  assert.equal(addWeeks('2025-W01', -1), '2024-W52');
  assert.equal(addWeeks('2026-W10', 0), '2026-W10');
});
