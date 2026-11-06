import {
  identity,
  compose,
  invert,
  transformPoint,
  fromComponents,
  decompose,
  type Matrix2D,
  type Point2D,
  type Components2D,
} from '@lp-labs/affine-transform';
const m: Matrix2D = compose(identity(), invert([2, 0, 0, 2, 0, 0]));
const p: Point2D = transformPoint(m, { x: 1, y: 2 });
const c: Components2D = decompose(m);
fromComponents({ ...c, translation: p });
// @ts-expect-error Matrix requires six numbers.
compose([1, 0, 0], m);
// @ts-expect-error Numeric coordinates only.
transformPoint(m, { x: '1', y: 0 });
