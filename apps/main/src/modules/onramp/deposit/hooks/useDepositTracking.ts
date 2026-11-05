import { XcJourneyBuilder } from "@galacticcouncil/xc-scan"
import { useQuery } from "@tanstack/react-query"

import { findDepositJourney } from "@/modules/onramp/deposit/DepositTracking.utils"
import type { SubmittedDeposit } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { isXcScanAddress, useXcScan } from "@/modules/xcm/history/useXcScan"
import { xcScanHttpClient } from "@/modules/xcm/history/xcScanStore"

export const useDepositTracking = (submitted: SubmittedDeposit) => {
  const source = useXcScan(submitted.sourceAddress)
  const destination = useXcScan(submitted.destinationAddress)
  const query = useQuery({
    queryKey: [
      "deposit",
      "tracking",
      submitted.txHash,
      submitted.sourceAddress,
      submitted.destinationAddress,
    ],
    enabled: !submitted.settled && !submitted.error,
    refetchInterval: !submitted.settled && !submitted.error ? 15000 : false,
    queryFn: async () => {
      const addresses = [
        ...new Set([submitted.sourceAddress, submitted.destinationAddress]),
      ].filter(isXcScanAddress)
      const results = await Promise.allSettled(
        addresses.map(async (address) => {
          const request = XcJourneyBuilder.journeys()
            .address(address)
            .build({ validate: true })
          return (
            await xcScanHttpClient.queryCrosschain(request, { limit: 100 })
          ).items
        }),
      )
      const successful = results.filter(
        (result) => result.status === "fulfilled",
      )
      if (!successful.length)
        throw new Error("Transfer tracking is temporarily unavailable")
      return successful.flatMap((result) => result.value)
    },
  })
  return {
    ...query,
    journey: findDepositJourney(submitted, [
      ...source.data,
      ...destination.data,
      ...(query.data ?? []),
    ]),
  }
}
