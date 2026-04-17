import { useAccount } from "@galacticcouncil/web3-connect"
import { useMemo } from "react"

import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useXcScan } from "@/modules/xcm/history/useXcScan"

export const useClaimableTransactions = () => {
  const { account } = useAccount()
  const { data: claimable } = useXcScan(account?.address ?? "", {
    claimableOnly: true,
  })
  const { pendingCorrelationIds } = usePendingClaimsStore()
  return useMemo(() => {
    const pending = new Set(pendingCorrelationIds)
    return claimable.filter(({ correlationId }) => !pending.has(correlationId))
  }, [claimable, pendingCorrelationIds])
}
