import Big from "big.js"
import { useMemo } from "react"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { XykDeposit } from "@/api/account"
import { useShareTokenPrices } from "@/api/spotPrice"
import { TShareToken, useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { toBig } from "@/utils/formatting"

import { LiquidityPositionByAsset } from "./MyLiquidityTable.data"

type IsolatedPoolsLiquidityByPool = Omit<
  LiquidityPositionByAsset,
  "meta" | "positions"
> & {
  positions: Array<XykDeposit & { price: string; meta: TShareToken }>
  meta: TShareToken
}
type ShareTokenBalance = { shares: bigint; amm_pool_id: string }
const isDeposit = (
  position: XykDeposit | ShareTokenBalance,
): position is XykDeposit => "id" in position

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

    const xykArray: Array<XykDeposit | ShareTokenBalance> = [
      ...xykMining,
      ...shareTokensBalances,
    ]
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

      const totalHuman = toBig(total, meta.decimals)
      const totalDisplay = totalHuman.times(price).toString()

      xykEntries.push({
        currentValueHuman: totalHuman.toString(),
        currentTotalDisplay: totalDisplay.toString(),
        currentHubValueHuman: "0",
        positions: shareTokenEntry.filter(isDeposit).map((p) => ({
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
