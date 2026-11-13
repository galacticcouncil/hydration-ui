import Big from "big.js"

import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"

type PairAssets = Pick<MultiplyPair, "collateralAssetId">

/** The asset the user enters with: `?pay=` from the URL, or the collateral. */
export const getPayAssetId = (pair: PairAssets, pay: string | undefined) =>
  pay ?? pair.collateralAssetId

/**
 * What the amount input may spend of the pay asset. `spendable` already leaves
 * the tx fee behind; paying with the fee-budget asset also keeps the budget
 * the open pulls from the wallet. Human-unit strings.
 */
export const getPayMaxBalance = ({
  spendable,
  payAssetId,
  feeAssetId,
  feeBudget,
}: {
  spendable: string
  payAssetId: string
  feeAssetId: string
  feeBudget: string
}) => {
  if (payAssetId !== feeAssetId) return spendable
  const left = Big(spendable || "0").minus(feeBudget)
  return left.gt(0) ? left.toString() : "0"
}

/**
 * The ranked pay list comes from wallet balances, so a collateral the user
 * doesn't hold would be missing; it goes on top with a zero balance. An empty
 * list stays empty: the picker then lists every tradable asset instead.
 */
export const withCollateralFirst = <T extends { id: string }>(
  assets: T[],
  collateral: T,
) =>
  !assets.length || assets.some((a) => a.id === collateral.id)
    ? assets
    : [{ ...collateral, balance: "0", balanceDisplay: "0" }, ...assets]

export type PayQuoteState =
  | "idle"
  | "loading"
  | "noRoute"
  | "tooSmall"
  | "ready"

/**
 * Whether the pay → collateral sell can go ahead. A hop rejecting the amount
 * as too small is told apart; every other failure reads as no route.
 */
export const getPayQuoteState = ({
  isLoading,
  isError,
  swap,
}: {
  isLoading: boolean
  isError: boolean
  swap?: { amountOut: bigint; swaps: { errors: readonly string[] }[] }
}): PayQuoteState => {
  if (isLoading) return "loading"
  if (isError) return "noRoute"
  if (!swap) return "idle"
  const errors = swap.swaps.flatMap((s) => s.errors)
  if (errors.includes("InsufficientTradingAmount")) return "tooSmall"
  if (errors.length || swap.amountOut <= 0n) return "noRoute"
  return "ready"
}
