import test from 'node:test';
import assert from 'node:assert/strict';
import {
  identity,
  compose,
  invert,
  transformPoint,
  fromComponents,
  decompose,
} from '../dist/esm/index.js';
const near = (a, b, t = 1e-10) =>
  assert.ok(Math.abs(a - b) <= t * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);
test('identity and composition order', () => {
  assert.deepEqual(identity(), [1, 0, 0, 1, 0, 0]);
  assert.deepEqual(
    transformPoint(compose([2, 0, 0, 2, 0, 0], [1, 0, 0, 1, 3, 4]), { x: 1, y: 2 }),
    { x: 8, y: 12 },
  );
});
test('inverse roundtrip and copied output', () => {
  const m = [2, 1, -1, 3, 7, -4],
    copy = [...m],
    p = { x: 11, y: -2 };
  const q = transformPoint(invert(m), transformPoint(m, p));
  near(q.x, p.x);
  near(q.y, p.y);
  assert.deepEqual(m, copy);
  assert.notEqual(compose(identity(), m), m);
});
test('singular and relative conditioning limits', () => {
  for (const m of [
    [0, 0, 0, 0, 0, 0],
    [1, 1, 2, 2, 0, 0],
    [1, 0, 0, 1e-14, 0, 0],
  ])
    assert.throws(() => invert(m), RangeError);
  assert.ok(invert([1, 0, 0, 1e-14, 0, 0], 0));
  assert.throws(() => invert(identity(), 1), RangeError);
});
test('large and small scales invert without determinant overflow', () => {
  assert.equal(invert([1e200, 0, 0, 1e200, 0, 0])[0], 1e-200);
  assert.equal(invert([1e-200, 0, 0, 1e-200, 0, 0])[0], 1e200);
  assert.throws(() => invert([Number.MIN_VALUE, 0, 0, Number.MIN_VALUE, 0, 0]), RangeError);
});
test('reflection and shear decomposition reconstruction', () => {
  const c = { translation: { x: 4, y: 5 }, rotation: 0.7, scaleX: 2, scaleY: -3, shear: 0.4 };
  const m = fromComponents(c),
    d = decompose(m),
    rebuilt = fromComponents(d);
  m.forEach((v, i) => near(v, rebuilt[i]));
  assert.ok(d.scaleX > 0);
  assert.ok(d.scaleY < 0);
});
test('nonfinite, malformed, overflow and no mutation', () => {
  assert.throws(() => compose([1, 0, 0, 1, 0, NaN], identity()), RangeError);
  assert.throws(() => transformPoint(identity(), { x: Infinity, y: 0 }), RangeError);
  assert.throws(() => compose([1e308, 0, 0, 1, 0, 0], [2, 0, 0, 1, 0, 0]), RangeError);
  assert.throws(() => invert([1, 0, 0]), RangeError);
});
test('seeded independent homogeneous-matrix multiplication oracle', () => {
  let seed = 410;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32) * 4 - 2;
  for (let i = 0; i < 100; i++) {
    const a = Array.from({ length: 6 }, random),
      b = Array.from({ length: 6 }, random);
    const A = [
        [a[0], a[2], a[4]],
        [a[1], a[3], a[5]],
        [0, 0, 1],
      ],
      B = [
        [b[0], b[2], b[4]],
        [b[1], b[3], b[5]],
        [0, 0, 1],
      ];
    const C = A.map((row) => B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0))),
      m = compose(a, b);
    [C[0][0], C[1][0], C[0][1], C[1][1], C[0][2], C[1][2]].forEach((v, j) => near(v, m[j]));
  }
});
