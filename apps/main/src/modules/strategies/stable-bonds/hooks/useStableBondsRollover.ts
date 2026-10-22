import Big from "big.js"
import { useMemo } from "react"

import { useAccountBalances } from "@/api/balances"
import { useBestNumber } from "@/api/chain"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { getRolloverApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssets } from "@/providers/assetsProvider"

/**
 * Resolves the OTC order that swaps `sourceBondId` for its configured
 * successor. The order id alone is not trusted — the asset pair is verified
 * too, so a mistyped config renders nothing instead of filling an unrelated
 * order with the user's bonds.
 */
export const useStableBondsRollover = (sourceBondId: string) => {
  const { getBond } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { data: offers } = useOtcOffers()
  const { data: bestNumber } = useBestNumber()

  const balance = getTransferableBalance(sourceBondId)
  const now = bestNumber?.timestamp ?? Date.now()

  return useMemo(() => {
    const rollover = STABLE_BONDS[sourceBondId]?.rollover
    if (!rollover || balance === 0n) return null

    const sourceBond = getBond(sourceBondId)
    const toBond = getBond(rollover.toBondId)
    if (!sourceBond || !toBond) return null

    const order = offers?.find(
      (offer) =>
        offer.id === rollover.otcOfferId &&
        offer.assetIn.id === sourceBondId &&
        offer.assetOut.id === rollover.toBondId,
    )

    if (!order || !Big(order.assetAmountIn).gt(0)) return null

    const rate = Big(order.assetAmountOut).div(order.assetAmountIn)

    return {
      order,
      toBond,
      apr: getRolloverApr(rate, sourceBond.maturity, toBond.maturity, now),
    }
  }, [balance, getBond, now, offers, sourceBondId])
}
