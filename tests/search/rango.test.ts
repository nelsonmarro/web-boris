import { test } from "node:test";
import assert from "node:assert/strict";
import { rangoDeRegistro } from "../../src/core/search/rango.ts";

const r = (o: number, t: number) => {
  const x = rangoDeRegistro(o, t);
  return [
    x.actual.nombre,
    x.siguiente?.nombre ?? null,
    x.siguiente?.faltan ?? null,
  ] as const;
};

test("0 abiertos es Civil y falta 1 para Recluta", () => {
  assert.deepEqual(r(0, 20), ["Civil", "Recluta", 1]);
});

test("límites con total 20", () => {
  assert.deepEqual(r(1, 20), ["Recluta", "Operativo", 4]);
  assert.deepEqual(r(4, 20), ["Recluta", "Operativo", 1]);
  assert.deepEqual(r(5, 20), ["Operativo", "Analista", 5]);
  assert.deepEqual(r(9, 20), ["Operativo", "Analista", 1]);
  assert.deepEqual(r(10, 20), ["Analista", "Investigador jefe", 6]);
  assert.deepEqual(r(15, 20), ["Analista", "Investigador jefe", 1]);
  assert.deepEqual(r(16, 20), ["Investigador jefe", "Acceso total", 4]);
  assert.deepEqual(r(19, 20), ["Investigador jefe", "Acceso total", 1]);
  assert.deepEqual(r(20, 20), ["Acceso total", null, null]);
});

test("faltan redondea hacia arriba con totales que no son múltiplos", () => {
  // total 23: 25 % = 5.75 -> 6
  assert.deepEqual(r(5, 23), ["Recluta", "Operativo", 1]);
  assert.deepEqual(r(6, 23), ["Operativo", "Analista", 6]);
});

test("total 0: Civil y sin siguiente", () => {
  assert.deepEqual(r(0, 0), ["Civil", null, null]);
  assert.deepEqual(r(5, 0), ["Civil", null, null]);
});

test("abiertos mayor que total se limita a Acceso total", () => {
  assert.deepEqual(r(30, 20), ["Acceso total", null, null]);
});

test("con pocos expedientes los rangos siguen siendo distintos y Acceso total solo al completar", () => {
  assert.equal(rangoDeRegistro(1, 1).actual.nombre, "Acceso total");
  assert.notEqual(rangoDeRegistro(2, 3).actual.nombre, "Acceso total");
  assert.equal(rangoDeRegistro(3, 3).actual.nombre, "Acceso total");
  for (const t of [1, 2, 3, 4, 5, 7, 23, 100]) {
    let prev = -1;
    const ids = [
      "civil",
      "recluta",
      "operativo",
      "analista",
      "investigador-jefe",
      "acceso-total",
    ];
    for (let o = 0; o <= t; o++) {
      const i = ids.indexOf(rangoDeRegistro(o, t).actual.id);
      assert.ok(i >= prev, `monótono t=${t} o=${o}`);
      prev = i;
    }
    if (t > 1)
      assert.notEqual(rangoDeRegistro(t - 1, t).actual.id, "acceso-total");
  }
});
