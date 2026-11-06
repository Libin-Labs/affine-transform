/** Column-vector matrix [a,b,c,d,tx,ty]: x'=a*x+c*y+tx, y'=b*x+d*y+ty. */
export type Matrix2D = readonly [number, number, number, number, number, number];
export interface Point2D {
  readonly x: number;
  readonly y: number;
}
export interface Components2D {
  readonly translation: Point2D;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  /** Dimensionless x shear before scale and rotation. */
  readonly shear: number;
}
function finite(values: readonly number[]): void {
  if (!values.every(Number.isFinite))
    throw new RangeError('Expected finite numbers; result may overflow');
}
function matrix(m: Matrix2D): void {
  if (m.length !== 6) throw new RangeError('Expected six coefficients');
  finite(m);
}
function result(v: [number, number, number, number, number, number]): Matrix2D {
  finite(v);
  return v;
}
export function identity(): Matrix2D {
  return [1, 0, 0, 1, 0, 0];
}
/** compose(left,right) applies right first. */
export function compose(left: Matrix2D, right: Matrix2D): Matrix2D {
  matrix(left);
  matrix(right);
  const [a, b, c, d, e, f] = left,
    [g, h, i, j, k, l] = right;
  return result([
    a * g + c * h,
    b * g + d * h,
    a * i + c * j,
    b * i + d * j,
    a * k + c * l + e,
    b * k + d * l + f,
  ]);
}
export function transformPoint(m: Matrix2D, p: Point2D): Point2D {
  matrix(m);
  finite([p.x, p.y]);
  const x = m[0] * p.x + m[2] * p.y + m[4],
    y = m[1] * p.x + m[3] * p.y + m[5];
  finite([x, y]);
  return { x, y };
}
/** Rejects |det(A/maxAbs(A))| <= relativeTolerance (default 1e-12). */
export function invert(m: Matrix2D, relativeTolerance = 1e-12): Matrix2D {
  matrix(m);
  finite([relativeTolerance]);
  if (relativeTolerance < 0 || relativeTolerance >= 1)
    throw new RangeError('Invalid relativeTolerance');
  const [a, b, c, d, e, f] = m,
    s = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d));
  if (s === 0) throw new RangeError('Singular matrix');
  const aa = a / s,
    bb = b / s,
    cc = c / s,
    dd = d / s,
    det = aa * dd - bb * cc;
  if (Math.abs(det) <= relativeTolerance)
    throw new RangeError('Singular or ill-conditioned matrix');
  const ia = dd / det / s,
    ib = -bb / det / s,
    ic = -cc / det / s,
    id = aa / det / s;
  return result([ia, ib, ic, id, -ia * e - ic * f, -ib * e - id * f]);
}
export function fromComponents(c: Components2D): Matrix2D {
  finite([c.translation.x, c.translation.y, c.rotation, c.scaleX, c.scaleY, c.shear]);
  const cos = Math.cos(c.rotation),
    sin = Math.sin(c.rotation);
  return result([
    cos * c.scaleX,
    sin * c.scaleX,
    (cos * c.shear - sin) * c.scaleY,
    (sin * c.shear + cos) * c.scaleY,
    c.translation.x,
    c.translation.y,
  ]);
}
/** QR decomposition; scaleX positive, reflection carried by scaleY. */
export function decompose(m: Matrix2D, relativeTolerance = 1e-12): Components2D {
  invert(m, relativeTolerance);
  const [a, b, c, d, x, y] = m,
    scaleX = Math.hypot(a, b);
  finite([scaleX]);
  const u = a / scaleX,
    v = b / scaleX,
    scaleY = -v * c + u * d,
    shear = (u * c + v * d) / scaleY;
  finite([scaleY, shear]);
  return { translation: { x, y }, rotation: Math.atan2(b, a), scaleX, scaleY, shear };
}
