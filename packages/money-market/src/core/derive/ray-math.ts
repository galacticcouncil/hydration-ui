/**
 * Aave's fixed-point primitives as exact integer math (ADR-0006).
 *
 * Ray/wad arithmetic is integer arithmetic — Solidity has no decimals — so this
 * layer is `bigint`, not Big.js and not BigNumber.js. Every division truncates
 * toward zero, exactly as the contracts do. The blueprint's `wadToRay` picks up
 * BigNumber.js's global ROUND_HALF_UP via a bare `.decimalPlaces(0)`; that
 * inconsistency is deliberately not replicated.
 */

export const WAD = 10n ** 18n
export const HALF_WAD = WAD / 2n

export const RAY = 10n ** 27n
export const HALF_RAY = RAY / 2n

export const WAD_RAY_RATIO = 10n ** 9n

export function rayMul(a: bigint, b: bigint): bigint {
  return (HALF_RAY + a * b) / RAY
}

export function rayDiv(a: bigint, b: bigint): bigint {
  return (b / 2n + a * RAY) / b
}

export function rayToWad(a: bigint): bigint {
  return (WAD_RAY_RATIO / 2n + a) / WAD_RAY_RATIO
}

export function wadToRay(a: bigint): bigint {
  return a * WAD_RAY_RATIO
}

export function rayPow(a: bigint, p: bigint): bigint {
  let x = a
  let n = p
  let z = n % 2n === 0n ? RAY : x

  for (n = n / 2n; n !== 0n; n = n / 2n) {
    x = rayMul(x, x)

    if (n % 2n !== 0n) {
      z = rayMul(z, x)
    }
  }

  return z
}

/**
 * `rayPow` is slow and gas intensive, so v2 of the pool switched to a binomial
 * approximation at the contract level. The results are not exact to the last
 * decimal, but they are close enough — and they are what the chain reports.
 */
export function binomialApproximatedRayPow(base: bigint, exp: bigint): bigint {
  if (exp === 0n) return RAY

  const expMinusOne = exp - 1n
  const expMinusTwo = exp > 2n ? exp - 2n : 0n

  const basePowerTwo = rayMul(base, base)
  const basePowerThree = rayMul(basePowerTwo, base)

  const firstTerm = exp * base
  const secondTerm = (exp * expMinusOne * basePowerTwo) / 2n
  const thirdTerm = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n

  return RAY + firstTerm + secondTerm + thirdTerm
}
