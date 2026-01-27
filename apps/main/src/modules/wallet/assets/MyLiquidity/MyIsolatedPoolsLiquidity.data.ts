import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { XykDeposit } from "@/api/account"
import { useShareTokenPrices } from "@/api/spotPrice"
import {
  isShareToken,
  TShareToken,
  useAssets,
} from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"

import {
  LiquidityPositionByAsset,
  OmnipoolLiquidityByAsset,
} from "./MyLiquidityTable.data"

export type ShareTokenBalance = {
  shares: bigint
  amm_pool_id: string
  price: string
  meta: TShareToken
}

export type XYKPositionDeposit = XykDeposit & {
  price: string
  meta: TShareToken
}

export type XYKPosition = XYKPositionDeposit | ShareTokenBalance

export type IsolatedPoolsLiquidityByPool = Omit<
  OmnipoolLiquidityByAsset,
  "meta" | "positions"
> & {
  positions: Array<XYKPosition>
  meta: TShareToken
}

export const isIsolatedPoolLiquidity = (
  pool: LiquidityPositionByAsset | IsolatedPoolsLiquidityByPool,
): pool is IsolatedPoolsLiquidityByPool => isShareToken(pool.meta)

export const isXYKPositionDeposit = (
  position: XYKPosition,
): position is XYKPositionDeposit => "id" in position

export const useMyIsolatedPoolsLiquidity = () => {
  const { getShareToken, getShareTokenByAddress } = useAssets()
  const xykMining = useAccountData(useShallow(prop("xykMining")))
  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )

  const shareTokensBalances = useMemo(() => {
    const accountXYKShareTokens: Array<{
      shares: bigint
      amm_pool_id: string
    }> = []
    for (const balance of Object.values(balances)) {
      const shareToken = getShareToken(balance.assetId)

      if (!shareToken) continue

      accountXYKShareTokens.push({
        shares: balance.transferable,
        amm_pool_id: shareToken.poolAddress,
      })
    }

    return accountXYKShareTokens
  }, [balances, getShareToken])

  const { data: shareTokenPrices, isLoading: isShareTokenPricesLoading } =
    useShareTokenPrices([
      ...xykMining.map((p) => p.amm_pool_id),
      ...shareTokensBalances.map((p) => p.amm_pool_id),
    ])

  const groupedXykData = useMemo<Array<IsolatedPoolsLiquidityByPool>>(() => {
    if (isShareTokenPricesLoading) return []

    const xykArray: Array<
      XykDeposit | Omit<ShareTokenBalance, "price" | "meta">
    > = [...shareTokensBalances, ...xykMining]
    const groupedXykData = Object.groupBy(xykArray, (p) => p.amm_pool_id)

    const xykEntries: Array<IsolatedPoolsLiquidityByPool> = []

    for (const [amm_pool_id, shareTokenEntry] of Object.entries(
      groupedXykData,
    )) {
      const meta = getShareTokenByAddress(amm_pool_id)
      const price = shareTokenPrices.get(amm_pool_id)

      if (!meta || !price || !shareTokenEntry) continue

      const total = shareTokenEntry.reduce(
        (acc, p) => acc.plus(p.shares.toString()),
        Big(0),
      )

      const totalHuman = bigShift(total.toString(), -meta.decimals)
      const totalDisplay = totalHuman.times(price).toString()

      xykEntries.push({
        currentValueHuman: totalHuman.toString(),
        currentTotalDisplay: totalDisplay.toString(),
        currentHubValueHuman: "0",
        positions: shareTokenEntry.map((p) => ({
          ...p,
          price,
          meta,
        })),
        meta,
      })
    }

    return xykEntries
  }, [
    isShareTokenPricesLoading,
    shareTokenPrices,
    shareTokensBalances,
    xykMining,
    getShareTokenByAddress,
  ])

  return {
    data: groupedXykData,
    isLoading: isShareTokenPricesLoading || isBalanceLoading,
  }
}
