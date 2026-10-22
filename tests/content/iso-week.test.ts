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
