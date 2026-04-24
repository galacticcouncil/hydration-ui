import {
  safeConvertPublicKeyToSS58,
  safeConvertSS58toH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { XcJourney } from "@galacticcouncil/xc-scan"
import { differenceInMinutes } from "date-fns"
import { useEffect } from "react"
import { filter, map } from "rxjs"
import { decodeEventLog } from "viem"

import {
  createBasejumpScanQueryKey,
  useBasejumpScan,
} from "@/modules/xcm/history/useBasejumpScan"
import {
  getTransferAsset,
  resolveAssetIcon,
} from "@/modules/xcm/history/utils/assets"
import {
  createBjscanJourneyKey,
  mapTransferExecutedLogs,
  TransferExecutedEvt,
} from "@/modules/xcm/history/utils/basejump"
import { useRpcProvider } from "@/providers/rpcProvider"

const isValidForProcessing = (journey: XcJourney) =>
  journey.status === "sent" &&
  differenceInMinutes(new Date(), new Date(journey.sentAt ?? 0)) < 10

export const useProcessBasejumpScanJourneys = (address: string) => {
  const { papi, isLoaded, queryClient } = useRpcProvider()
  const { data: journeys } = useBasejumpScan(address)

  return useEffect(() => {
    if (!isLoaded || !journeys) return
    const journeysToProcess = journeys.filter(isValidForProcessing)
    if (journeysToProcess.length === 0) return

    const sub = papi.query.System.Events.watchValue("best")
      .pipe(
        map(mapTransferExecutedLogs),
        filter((events) => events.length > 0),
      )
      .subscribe((events) => {
        for (const { signatureTopic, topics, data } of events) {
          const decoded = decodeEventLog({
            abi: [TransferExecutedEvt],
            topics: [signatureTopic, ...topics],
            data,
          })

          const ss58 = safeConvertPublicKeyToSS58(decoded.args.recipient)
          const h160 = safeConvertSS58toH160(ss58)

          const completedJourneyKey = createBjscanJourneyKey({
            recipient: h160,
            asset: decoded.args.sourceAsset,
            amount: decoded.args.amount.toString(),
          })

          const completedJourney = journeysToProcess.find((journey) => {
            const transferAsset = getTransferAsset(journey)
            if (!transferAsset) return false
            const assetMeta = resolveAssetIcon(transferAsset.asset)
            const journeyKey = createBjscanJourneyKey({
              recipient: journey.to,
              asset: assetMeta?.assetId ?? "",
              amount: transferAsset.amount,
            })
            return stringEquals(journeyKey, completedJourneyKey)
          })

          if (completedJourney) {
            const queryKey = createBasejumpScanQueryKey(address)
            queryClient.setQueryData<XcJourney[]>(queryKey, (prev) => {
              if (!prev) return []
              return prev.map((item) => {
                if (item.correlationId === completedJourney.correlationId) {
                  return {
                    ...item,
                    status: "received",
                  }
                }
                return item
              })
            })
          }
        }
      })
    return () => {
      sub.unsubscribe()
    }
  }, [address, isLoaded, journeys, papi, queryClient])
}
