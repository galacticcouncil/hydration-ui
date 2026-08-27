import { useQuery } from "@tanstack/react-query"

import { dcaReceivedQuery, dcaSpentQuery } from "@/api/grafana/dcaAmount"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

interface UnsafeRemainingAmountsQuery {
  readonly DCA: {
    readonly RemainingAmounts: {
      readonly getValue: (scheduleId: number) => Promise<bigint | undefined>
    }
  }
}

export const useTradeOrderHistoryEnrichment = (
  scheduleId: number,
  from: TAsset,
  to: TAsset,
) => {
  const { papiClient, isApiLoaded } = useRpcProvider()

  const { data: remainingRaw, isLoading: isRemainingLoading } = useQuery({
    queryKey: ["trade", "orders", "history", "remaining", scheduleId],
    queryFn: async () => {
      const query = papiClient.getUnsafeApi()
        .query as unknown as UnsafeRemainingAmountsQuery
      const value = await query.DCA.RemainingAmounts.getValue(scheduleId)
      return value ?? null
    },
    enabled: isApiLoaded && !!scheduleId,
  })

  const { data: received = "0", isLoading: isReceivedLoading } = useQuery(
    dcaReceivedQuery(scheduleId),
  )
  const { data: spentRaw = "0", isLoading: isSpentLoading } = useQuery(
    dcaSpentQuery(scheduleId),
  )

  const remaining =
    remainingRaw !== undefined && remainingRaw !== null
      ? scaleHuman(remainingRaw, from.decimals)
      : "0"

  return {
    remaining,
    received: scaleHuman(received, to.decimals),
    spent: scaleHuman(spentRaw, from.decimals),
    isLoading: isRemainingLoading || isReceivedLoading || isSpentLoading,
  }
}
