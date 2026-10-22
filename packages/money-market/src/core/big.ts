import Big, { BigSource } from "big.js"

/**
 * The package's Big.js configuration, in one place.
 *
 * Big.js has no per-instance settings, so the only ways to reproduce Aave's two
 * rounding regimes are to mutate the global `Big.DP` / `Big.RM` — which would
 * race with unrelated Big.js math elsewhere in this repo — or to take isolated
 * constructors from the `Big()` factory. This module does the latter, which is
 * why nothing in the package ever touches the globals (ADR-0006).
 *
 * `Decimal` divides at twenty places, half up, matching the BigNumber.js
 * defaults the blueprint's quotients were produced under. `Integer` is the
 * blueprint's `BigNumberZeroDecimal`: quotients truncate to whole units, as the
 * contracts do. Note that `DP`/`RM` govern only `div`, `sqrt` and negative
 * `pow` — `times`, `plus` and `minus` are exact in both libraries.
 */
export const Decimal = Big()
Decimal.DP = 20
Decimal.RM = Big.roundHalfUp

export const Integer = Big()
Integer.DP = 0
Integer.RM = Big.roundDown

/**
 * Moves the decimal point exactly, the way BigNumber.js's `shiftedBy` does.
 * Dividing by a power of ten would round at the constructor's `DP` instead, and
 * these shifts only change the unit a value is expressed in.
 */
export function shift(value: Big, places: number): Big {
  const [mantissa, exponent] = value.toExponential().split("e")
  return Decimal(`${mantissa}e${Number(exponent) + places}`)
}

/**
 * Turns a raw base-unit value into a human-unit fixed-point string. `toFixed`
 * rather than `toString`, so Big.js's exponent threshold can never leak into
 * output (ADR-0006).
 */
export function normalize(value: BigSource, decimals: number): string {
  return shift(Decimal(value), -decimals).toFixed()
}

/**
 * A human-unit amount as raw base units, truncated to the asset's decimals.
 * Anything that is not a non-negative number — an empty field, a half-typed
 * `-` — reads as zero, since assessments run on every keystroke.
 */
export function toBaseUnits(amount: string, decimals: number): bigint {
  try {
    const raw = shift(Decimal(amount), decimals).round(0, Big.roundDown)
    return raw.gt(0) ? BigInt(raw.toFixed()) : 0n
  } catch {
    return 0n
  }
}

/** Truncates a human-unit value to the asset's decimals, never below zero. */
export function truncate(value: Big, decimals: number): string {
  return value.gt(0) ? value.round(decimals, Big.roundDown).toFixed() : "0"
}
