import {
  accountPublicKey,
  HYDRATION_PARACHAIN_ID,
} from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"

const HYDRATION_DESTINATION = `urn:ocn:polkadot:${HYDRATION_PARACHAIN_ID}`

export const filterClaimableDeposits = (
  journeys: readonly XcJourney[],
  recipientAddresses: readonly string[],
): XcJourney[] => {
  const recipientKeys = new Set(
    recipientAddresses.map(accountPublicKey).filter(Boolean),
  )
  if (!recipientKeys.size) return []

  const seen = new Set<string>()
  return journeys.filter((journey) => {
    if (
      journey.destination !== HYDRATION_DESTINATION ||
      !journey.origin ||
      journey.origin === HYDRATION_DESTINATION ||
      !journey.correlationId ||
      seen.has(journey.correlationId)
    ) {
      return false
    }

    // Prefer the raw recipient so inconsistent display metadata cannot redirect a claim.
    const recipientKey =
      accountPublicKey(journey.to) ||
      accountPublicKey(journey.toFormatted ?? "")
    if (!recipientKey || !recipientKeys.has(recipientKey)) return false

    seen.add(journey.correlationId)
    return true
  })
}
