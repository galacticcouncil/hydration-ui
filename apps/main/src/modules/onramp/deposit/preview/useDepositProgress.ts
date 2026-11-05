import { useNow } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { useDepositTracking } from "@/modules/onramp/deposit/hooks/useDepositTracking"
import {
  SubmittedDeposit,
  useDepositJourneyStore,
} from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { journeyRedeemedQuery } from "@/modules/xcm/history/hooks/useJourneyRedeemed"
import {
  isJourneyClaimReady,
  isJourneyPendingClaim,
} from "@/modules/xcm/history/utils/claim"
import {
  FAILED_STATUSES,
  getJourneyExplorerLink,
  SUCCESS_STATUSES,
} from "@/modules/xcm/history/utils/journey"
import { useToasts } from "@/states/toasts"

export const useDepositProgress = (submitted: SubmittedDeposit) => {
  const { t } = useTranslation("onramp")
  const { info } = useToasts()
  const tracking = useDepositTracking(submitted)
  const { journey } = tracking
  const claimable = !!journey && isJourneyPendingClaim(journey)
  const redeemed = useQuery({
    ...journeyRedeemedQuery(
      journey ??
        ({ correlationId: submitted.txHash } as NonNullable<typeof journey>),
    ),
    enabled: claimable && !submitted.settled,
    refetchInterval: claimable && !submitted.settled ? 15000 : false,
  })
  const arrived =
    submitted.settled ||
    (!!journey &&
      (claimable
        ? redeemed.data === true
        : SUCCESS_STATUSES.includes(journey.status)))
  const now = useNow(claimable && !arrived ? 1000 : null)
  const readyToClaim =
    !arrived &&
    claimable &&
    redeemed.data === false &&
    isJourneyClaimReady(journey, now)
  // An indexer timeout is not proof of a failed transfer and must not invite a resend.
  const timedOut = journey?.status === "timeout"
  const failed =
    !!submitted.error ||
    (!!journey && !timedOut && FAILED_STATUSES.includes(journey.status))
  useEffect(() => {
    if (arrived && !submitted.settled)
      useDepositJourneyStore
        .getState()
        .updateSubmitted({ settled: true, claimable: false }, submitted.txHash)
  }, [arrived, submitted.settled, submitted.txHash])
  useEffect(() => {
    if (arrived || !journey || (claimable && redeemed.data === undefined))
      return
    const store = useDepositJourneyStore.getState()
    const pending = store.pendingTransfers.find(
      (item) => item.txHash === submitted.txHash,
    )
    if (!pending || !!pending.claimable === readyToClaim) return
    store.updateSubmitted({ claimable: readyToClaim }, submitted.txHash)
    if (readyToClaim)
      info({
        id: `deposit-claim-${submitted.txHash}`,
        address: submitted.destinationAddress,
        title: t("deposit.v3.tracking.claimNotification"),
        link: getJourneyExplorerLink(journey),
      })
  }, [
    arrived,
    claimable,
    info,
    journey,
    readyToClaim,
    redeemed.data,
    submitted.destinationAddress,
    submitted.txHash,
    t,
  ])
  return { ...tracking, claimable, readyToClaim, arrived, failed, timedOut }
}
