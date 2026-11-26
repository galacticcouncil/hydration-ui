import { isHiddenReserve } from "@galacticcouncil/money-market/core"
import { useReserveSummaries } from "@galacticcouncil/money-market/react"
import type { MarketDescriptor } from "@galacticcouncil/money-market/types"
import { useMemo } from "react"

/** Visible reserves for discovery lists and market totals, not account math. */
export const useVisibleReserveSummaries = (market?: MarketDescriptor) => {
  const reserves = useReserveSummaries(market)
  const data = useMemo(
    () =>
      reserves.data?.filter(
        (reserve) => !isHiddenReserve(reserve.underlyingAsset),
      ) ?? [],
    [reserves.data],
  )

  return { ...reserves, data }
}
