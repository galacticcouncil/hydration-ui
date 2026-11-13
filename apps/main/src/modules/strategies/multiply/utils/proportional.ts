import Big from "big.js"
import { parseUnits } from "viem"

/**
 * The proportional option adds liquidity with the pool's reserves instead of
 * selling one asset; it's offered when the pay asset is one of several.
 */
export const canPayProportionally = (
  reserveIds: string[],
  payAssetId: string,
) => reserveIds.length > 1 && reserveIds.includes(payAssetId)

export type ProportionalInput = {
  assetId: string
  /** human units, as typed */
  amount: string
  decimals: number
  /** human units the user may spend */
  maxBalance: string
}

export type ProportionalState =
  | "idle"
  | "insufficientBalance"
  | "tooSmall"
  | "ready"

/**
 * Step 1 of a proportional entry: the `add_assets_liquidity` assets and its
 * `min_shares`, the supply modal's slippage floor on the estimated shares.
 * `shares` is that estimate in the share token's smallest unit.
 */
export const getProportionalEntry = ({
  inputs,
  shares,
  slippagePct,
}: {
  inputs: ProportionalInput[]
  shares: string
  slippagePct: number
}) => {
  const provided = inputs.filter(({ amount }) => Big(amount || "0").gt(0))
  const assets = provided.map(({ assetId, amount, decimals }) => ({
    asset_id: Number(assetId),
    amount: parseUnits(amount, decimals),
  }))
  const overBalanceIds = provided
    .filter(({ amount, maxBalance }) => Big(amount).gt(maxBalance || "0"))
    .map(({ assetId }) => assetId)
  const sharesOut = BigInt(Big(shares || "0").toFixed(0))
  const minShares = BigInt(
    Big(sharesOut.toString())
      .times(100 - slippagePct)
      .div(100)
      .toFixed(0, Big.roundDown),
  )

  const state: ProportionalState = !provided.length
    ? "idle"
    : overBalanceIds.length
      ? "insufficientBalance"
      : sharesOut <= 0n
        ? "tooSmall"
        : "ready"

  return { state, assets, shares: sharesOut, minShares, overBalanceIds }
}
