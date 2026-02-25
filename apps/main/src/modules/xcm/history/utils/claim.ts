import { getVaaHeader, isEvmChain, isSolanaChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  CallType,
  ChainEcosystem,
  EvmChain,
  SolanaChain,
} from "@galacticcouncil/xc-core"
import type {
  XcJourney,
  XcJourneyStop,
  XcJourneyWhStop,
} from "@galacticcouncil/xc-scan"
import {
  EvmCall,
  EvmClaim,
  SolanaCall,
  SolanaClaim,
} from "@galacticcouncil/xc-sdk"
import { minutesToMilliseconds } from "date-fns"

import { resolveNetwork } from "@/modules/xcm/history/utils/assets"

const CLAIM_THRESHOLD = minutesToMilliseconds(5)

function hasExceededClaimThreshold(emittedAt: number) {
  const now = Date.now()
  const emittedAtMs = emittedAt * 1000
  const deadline = emittedAtMs + CLAIM_THRESHOLD
  return now >= deadline
}

export function isJourneyClaimable(journey: XcJourney): boolean {
  const vaaHeader = getJourneyVaaHeader(journey)
  if (!vaaHeader) return false

  const toChain = resolveChainFromUrn(journey.destination)
  return !!toChain && hasExceededClaimThreshold(vaaHeader.timestamp)
}

export function getClaimableJourneys(journeys: XcJourney[]) {
  return journeys.filter(isJourneyClaimable)
}

function isWormholeStop(
  stop: XcJourneyStop | XcJourneyWhStop,
): stop is XcJourneyWhStop {
  return stop.type === "wormhole"
}

function findWormholeStop(journey: XcJourney): XcJourneyWhStop | undefined {
  const stops = journey?.stops ?? []
  return stops.find(isWormholeStop)
}

export function getJourneyVaaRaw(journey: XcJourney): string | undefined {
  if (journey.status !== "waiting") return

  const whStop = findWormholeStop(journey)

  if (whStop?.instructions?.type === "WormholeVAA") {
    return whStop.instructions.value?.raw
  }
}

export function getJourneyVaaHeader(journey: XcJourney) {
  const vaaRaw = getJourneyVaaRaw(journey)
  if (!vaaRaw) return
  return getVaaHeader(vaaRaw)
}

export function resolveChainFromUrn(
  destinationUrn: string,
): EvmChain | SolanaChain | undefined {
  const network = resolveNetwork(destinationUrn)
  if (!network) return

  const { ecosystem, chainId } = network

  const chain = chainsMap.values().find((c) => {
    switch (ecosystem) {
      case ChainEcosystem.Ethereum:
        return isEvmChain(c) && c.id === chainId
      case ChainEcosystem.Solana:
        return isSolanaChain(c) && c.id === chainId
      default:
        return false
    }
  })

  return chain as EvmChain | SolanaChain | undefined
}

type ClaimCallResult =
  | { type: CallType.Evm; call: EvmCall; chain: EvmChain }
  | {
      type: CallType.Solana
      call: SolanaCall | SolanaCall[]
      chain: SolanaChain
    }

export async function buildClaimCall(
  journey: XcJourney,
  claimerAddress: string,
): Promise<ClaimCallResult | undefined> {
  const vaaRaw = getJourneyVaaRaw(journey)
  const toChain = resolveChainFromUrn(journey.destination)
  if (!vaaRaw || !toChain) return undefined

  if (isEvmChain(toChain)) {
    const evmClaim = new EvmClaim(toChain)
    return {
      type: CallType.Evm,
      call: evmClaim.redeem(claimerAddress, vaaRaw),
      chain: toChain,
    }
  }

  if (isSolanaChain(toChain)) {
    const solanaClaim = new SolanaClaim(toChain)
    return {
      type: CallType.Solana,
      call: await solanaClaim.redeem(claimerAddress, vaaRaw),
      chain: toChain,
    }
  }

  return undefined
}
