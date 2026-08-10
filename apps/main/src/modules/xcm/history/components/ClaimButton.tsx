import { HYDRATION_CHAIN_KEY, useNow } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"

import { ClaimFlowModalButton } from "@/modules/xcm/history/components/ClaimFlowModalButton"
import { useDepositClaim } from "@/modules/xcm/history/hooks/useDepositClaim"
import { useJourneyRedeemed } from "@/modules/xcm/history/hooks/useJourneyRedeemed"
import { useWithdrawClaim } from "@/modules/xcm/history/hooks/useWithdrawClaim"
import {
  isJourneyClaimReady,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"

type ClaimButtonProps = {
  journey: XcJourney
}

const ClaimWithdrawButton: React.FC<ClaimButtonProps> = ({ journey }) => {
  const withdrawalMutation = useWithdrawClaim(journey)

  return (
    <ClaimFlowModalButton
      type="withdraw"
      journey={journey}
      mutation={withdrawalMutation}
    />
  )
}

const ClaimDepositButton: React.FC<ClaimButtonProps> = ({ journey }) => {
  const depositMutation = useDepositClaim(journey)

  return (
    <ClaimFlowModalButton
      type="deposit"
      journey={journey}
      mutation={depositMutation}
    />
  )
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ journey }) => {
  const now = useNow(isJourneyClaimReady(journey) ? null : 1000)
  const isReady = isJourneyClaimReady(journey, now)

  const { data: isRedeemed, isLoading: isRedeemedLoading } =
    useJourneyRedeemed(journey)

  if (!isReady || isRedeemedLoading || isRedeemed) return null

  const chain = resolveChainFromUrn(journey.destination)
  const isDeposit = chain?.key === HYDRATION_CHAIN_KEY

  return isDeposit ? (
    <ClaimDepositButton journey={journey} />
  ) : (
    <ClaimWithdrawButton journey={journey} />
  )
}
