import { useMemo } from "react"
import { formatUnits } from "viem"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { getStablepoolShares } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.utils"
import {
  useAddableStablepoolTokens,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { getPayMaxBalance } from "@/modules/strategies/multiply/utils/pay"
import {
  canPayProportionally,
  getProportionalEntry,
} from "@/modules/strategies/multiply/utils/proportional"
import { useFormMaxBalanceWithFee } from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export type ReserveAmount = { assetId: string; amount: string }

/**
 * The supply modal's split path, into the pair's share token: the pool's
 * addable reserves, their spendable balances, the estimated shares and step
 * 1's `dispatch_with_extra_gas(add_assets_liquidity{min_shares})`. The
 * supply modal's follow-up swap into the aToken is left out.
 */
export const useProportionalEntry = (
  pair: MultiplyPair,
  payAssetId: string,
  amounts: ReserveAmount[],
) => {
  const { papi } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const slippage = useTradeSettings((s) => s.liquidity.slippage)
  const { data: details } = useStablepoolReserves(pair.collateralAssetId)
  const reserves = useAddableStablepoolTokens(
    pair.collateralAssetId,
    details?.reserves ?? EMPTY,
  )
  const reserveIds = reserves.map((r) => r.asset_id.toString())
  const isAvailable = canPayProportionally(reserveIds, payAssetId)

  const buildTx = (assets: { asset_id: number; amount: bigint }[], min = 0n) =>
    papi.tx.Dispatcher.dispatch_with_extra_gas({
      call: papi.tx.Stableswap.add_assets_liquidity({
        pool_id: Number(pair.collateralAssetId),
        assets,
        min_shares: min,
      }).decodedCall,
      extra_gas: AAVE_GAS_LIMIT,
    })

  // the fee barely depends on the amounts; one unit of each reserve prices it
  const reserveKey = reserveIds.join()
  const feeTx = useMemo(
    () =>
      isAvailable
        ? buildTx(
            reserveIds.map((id) => ({ asset_id: Number(id), amount: 1n })),
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAvailable, reserveKey, papi],
  )
  const { getMaxBalance } = useFormMaxBalanceWithFee(feeTx)
  const feeBudget = formatUnits(
    pair.feeBudget,
    getAssetWithFallback(pair.feeAssetId).decimals,
  )
  const getReserveMax = (assetId: string) =>
    getPayMaxBalance({
      spendable: getMaxBalance(getAssetWithFallback(assetId)),
      payAssetId: assetId,
      feeAssetId: pair.feeAssetId,
      feeBudget,
    })

  const shares =
    details && amounts.length
      ? getStablepoolShares(
          amounts.map(({ assetId, amount }) => ({
            asset: getAssetWithFallback(assetId),
            amount,
          })),
          details.reserves.map((r) => ({ asset: r.meta, balance: r.amount })),
          details.pool,
        )
      : 0

  const entry = getProportionalEntry({
    inputs: amounts.map(({ assetId, amount }) => ({
      assetId,
      amount,
      decimals: getAssetWithFallback(assetId).decimals,
      maxBalance: getReserveMax(assetId),
    })),
    shares: String(shares),
    slippagePct: slippage,
  })

  return {
    isAvailable,
    reserveIds,
    getReserveMax,
    ...entry,
    /** step 1's call; null until the amounts can be submitted */
    buildStep1: () =>
      entry.state === "ready" ? buildTx(entry.assets, entry.minShares) : null,
  }
}

const EMPTY: never[] = []
