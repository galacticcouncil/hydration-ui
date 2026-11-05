import { useAccount } from "@galacticcouncil/web3-connect"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"

import { useClaimableTransactions } from "@/modules/xcm/history/hooks/useClaimableTransactions"
import { journeyRedeemedQuery } from "@/modules/xcm/history/hooks/useJourneyRedeemed"

import { filterClaimableDeposits } from "./useClaimableDeposits.utils"

export const useClaimableDeposits = (): XcJourney[] => {
  const { account } = useAccount()
  const claimableTransactions = useClaimableTransactions()
  const candidates = useMemo(
    () =>
      filterClaimableDeposits(claimableTransactions, [
        account?.rawAddress ?? "",
        account?.address ?? "",
      ]),
    [account?.address, account?.rawAddress, claimableTransactions],
  )
  const redeemedResults = useQueries({
    queries: candidates.map(journeyRedeemedQuery),
  })

  // Reuse the native cache, but do not announce a claim before its redemption check succeeds.
  return useMemo(
    () =>
      candidates.filter((_, index) => {
        const result = redeemedResults[index]
        return result?.isSuccess && result.data === false
      }),
    [candidates, redeemedResults],
  )
}
