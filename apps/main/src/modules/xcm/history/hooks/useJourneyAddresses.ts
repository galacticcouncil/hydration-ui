import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { XcJourney } from "@galacticcouncil/xc-scan"

import { useSolanaTokenAccountOwner } from "@/api/solana"
import { resolveNetwork } from "@/modules/xcm/history/utils/assets"
import { getFormattedAddresses } from "@/modules/xcm/history/utils/journey"

/**
 * Journey addresses for display. Wormhole delivers Solana transfers into
 * the recipient's associated token account, so indexers report the ATA
 * as the destination - resolve it to its owner (the actual wallet).
 */
export function useJourneyAddresses(journey: XcJourney) {
  const { from, to } = getFormattedAddresses(journey)

  const isSolanaDestination =
    resolveNetwork(journey.destination)?.ecosystem === ChainEcosystem.Solana

  const { data: owner } = useSolanaTokenAccountOwner(to, isSolanaDestination)

  return { from, to: owner ?? to }
}
