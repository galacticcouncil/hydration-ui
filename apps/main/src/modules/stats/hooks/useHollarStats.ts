import { getGhoReserve } from "@galacticcouncil/money-market/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useBorrowReserves } from "@/api/borrow"
import { HOLLAR_STABILITY_MODULE } from "@/api/treasury"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const useHollarStats = () => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const hollarMeta = getAssetWithFallback(HOLLAR_ASSET_ID)

  const { data: borrowReserves, isLoading: isReservesLoading } =
    useBorrowReserves()
  const { data: hsmHollarBalance, isLoading: isHsmHollarBalanceLoading } =
    useQuery({
      queryKey: ["hsmHollarBalance"],
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      enabled: rpc.isApiLoaded,
      queryFn: async () => {
        const { transferable } = await rpc.sdk.client.balance.getBalance(
          HOLLAR_STABILITY_MODULE.address,
          Number(HOLLAR_ASSET_ID),
        )

        return transferable
      },
    })

  const isLoading = isReservesLoading || isHsmHollarBalanceLoading

  const stats = useMemo(() => {
    const hsmHollarSupply = Number(
      scaleHuman(hsmHollarBalance ?? 0n, hollarMeta.decimals),
    )
    let hollarSupply = hsmHollarSupply
    let hollarPeg = 1.0

    if (borrowReserves?.formattedReserves) {
      const ghoReserve = getGhoReserve(borrowReserves.formattedReserves)
      if (ghoReserve) {
        hollarSupply += parseFloat(ghoReserve.totalDebtUSD)
        hollarPeg = parseFloat(ghoReserve.priceInUSD)
      }
    }

    return {
      hollarSupply,
      hollarPeg,
    }
  }, [hsmHollarBalance, hollarMeta.decimals, borrowReserves])

  return {
    stats,
    isLoading,
  }
}
