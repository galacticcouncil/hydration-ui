import type { XcJourney } from "@galacticcouncil/xc-scan"

import type { SubmittedDeposit } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import {
  isOptimisticJourney,
  isSameTransfer,
} from "@/modules/xcm/history/utils/optimistic"

// Never infer arrival from the optimistic placeholder or a different hop's receipt.
export const findDepositJourney = (
  submitted: SubmittedDeposit,
  journeys: XcJourney[],
): XcJourney | undefined => {
  const real = [
    ...new Map(
      journeys
        .filter(
          (journey) =>
            !isOptimisticJourney(journey) &&
            journey.destination === "urn:ocn:polkadot:2034",
        )
        .map((journey) => [journey.correlationId, journey]),
    ).values(),
  ]
  const exact = real.filter((journey) =>
    [journey.originTxPrimary, journey.originTxSecondary].some(
      (hash) =>
        !!hash &&
        (hash.startsWith("0x") && submitted.txHash.startsWith("0x")
          ? hash.toLowerCase() === submitted.txHash.toLowerCase()
          : hash === submitted.txHash),
    ),
  )
  if (exact.length === 1) return exact[0]
  if (exact.length > 1 || !submitted.optimistic) return undefined
  const correlated = real.filter((journey) =>
    isSameTransfer(submitted.optimistic!, journey),
  )
  return correlated.length === 1 ? correlated[0] : undefined
}
