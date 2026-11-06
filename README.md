# @lp-labs/affine-transform

Column-vector 2D affine transforms and QR decomposition, not a general vector library.

Catalog ID 410. Version 0.1.0. Standalone, zero runtime, peer or sibling dependencies.
Node.js >=18; strict TypeScript; NodeNext ESM and CommonJS with separate declaration trees.

## Install

```sh
npm install @lp-labs/affine-transform
```

## Quickstart (JavaScript ESM)

```js
import { compose, invert, transformPoint } from '@lp-labs/affine-transform';
const matrix = compose([2, 0, 0, 2, 0, 0], [1, 0, 0, 1, 3, 4]);
console.log(transformPoint(matrix, { x: 1, y: 2 })); // { x: 8, y: 12 }
console.log(transformPoint(invert(matrix), { x: 8, y: 12 })); // { x: 1, y: 2 }
```

CommonJS exposes the same named exports with `require('@lp-labs/affine-transform')`.
Use the bare package name in NodeNext TypeScript `.mts` and `.cts` consumers.
The package has no default export, global side effects, browser globals, network access or file access.

## Contracts, options, errors and customization

- `identity()` returns a fresh identity tuple. `compose(left, right)` applies right first; translation is in the last two coefficients.
- `transformPoint` returns a new point. `invert` normalizes linear coefficients before computing a determinant, avoiding determinant overflow. It rejects `abs(det(A / maxAbs(A))) <= relativeTolerance`, default `1e-12`; tolerance must be finite in `[0,1)`. Zero tolerance permits any representable nonzero normalized determinant, not exact arithmetic.
- `fromComponents` constructs rotation × x-shear × scale plus translation. `decompose` is QR with nonnegative `scaleX` (strictly positive for accepted matrices), reflection in signed `scaleY`, radians, and dimensionless shear. It validates invertibility using the same tolerance.
- Inputs are finite numbers, matrix length exactly six. `RangeError` signals malformed tuples, singular/ill-conditioned matrices, or nonfinite intermediate/output arithmetic. Cancellation can lose precision; this is not arbitrary precision or a condition-number estimator. Extremely anisotropic or underflowing matrices may be rejected even with zero tolerance.
- All operations are O(1), allocate independent outputs, and do not mutate inputs. Customize via components and explicit inversion/decomposition tolerance.

## Complete public declarations

All runtime exports, public types, options and return values follow. Readonly declarations
describe caller-facing ownership; results are not recursively frozen at runtime.

```ts
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
export declare function identity(): Matrix2D;
/** compose(left,right) applies right first. */
export declare function compose(left: Matrix2D, right: Matrix2D): Matrix2D;
export declare function transformPoint(m: Matrix2D, p: Point2D): Point2D;
/** Rejects |det(A/maxAbs(A))| <= relativeTolerance (default 1e-12). */
export declare function invert(m: Matrix2D, relativeTolerance?: number): Matrix2D;
export declare function fromComponents(c: Components2D): Matrix2D;
/** QR decomposition; scaleX positive, reflection carried by scaleY. */
export declare function decompose(m: Matrix2D, relativeTolerance?: number): Components2D;
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

An offline install requires the pinned lockfile's development packages in the local npm cache.
Development-only dependencies: TypeScript ^5.9.3 and Prettier ^3.6.2.
Build emits `dist/esm` and `dist/cjs`, each with declarations; CommonJS has its own package boundary.
Tests cover finite bounds, degeneracy, ownership, work limits, deterministic results and independent reference checks.
Consumer fixtures exercise bare-package ESM/CJS declaration resolution with negative compile-time checks.
Only dist, README, LICENSE and package metadata are published. No automatic publishing is performed.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
