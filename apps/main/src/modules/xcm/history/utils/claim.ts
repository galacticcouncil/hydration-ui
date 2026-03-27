import {
  getVaaHeader,
  isAnyParachain,
  isEvmChain,
  isEvmParachain,
  isSolanaChain,
  isSuiChain,
  safeParse,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  AnyChain,
  CallType,
  ChainEcosystem,
  EvmChain,
  Parachain,
  SolanaChain,
  SuiChain,
} from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import {
  EvmCall,
  EvmClaim,
  SolanaCall,
  SolanaClaim,
  SubstrateCall,
  SubstrateClaim,
  SuiCall,
  SuiClaim,
} from "@galacticcouncil/xc-sdk"
import { minutesToMilliseconds } from "date-fns"
import { isString } from "remeda"

import {
  getTransferAsset,
  resolveNetwork,
} from "@/modules/xcm/history/utils/assets"
import {
  XcJourneyStop,
  XcJourneyWhStop,
} from "@/modules/xcm/history/utils/journey"

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
  if (!toChain) return false

  const asset = getTransferAsset(journey)
  if (!asset) return false

  return hasExceededClaimThreshold(vaaHeader.timestamp)
}

export function getClaimableJourneys(journeys: XcJourney[]) {
  return journeys.filter(isJourneyClaimable)
}

function isWormholeStop(stop: XcJourneyStop): stop is XcJourneyWhStop {
  return stop.type === "wormhole"
}

function findWormholeStop(journey: XcJourney): XcJourneyWhStop | undefined {
  const stops = isString(journey.stops)
    ? safeParse<XcJourneyStop>(journey.stops)
    : undefined

  if (!Array.isArray(stops)) return undefined
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
): AnyChain | undefined {
  const network = resolveNetwork(destinationUrn)
  if (!network) return

  const { ecosystem, chainId } = network

  const chain = chainsMap.values().find((c) => {
    switch (ecosystem) {
      case ChainEcosystem.Ethereum:
        return isEvmChain(c) && c.id === Number(chainId)
      case ChainEcosystem.Solana:
        return isSolanaChain(c) && c.id === Number(chainId)
      case ChainEcosystem.Sui:
        return isSuiChain(c) && c.id === chainId
      case ChainEcosystem.Polkadot:
      case ChainEcosystem.Kusama:
        return isAnyParachain(c) && c.parachainId === Number(chainId)
      default:
        return false
    }
  })

  return chain
}

type ClaimCallResult =
  | { type: CallType.Evm; call: EvmCall; chain: EvmChain }
  | {
      type: CallType.Solana
      call: SolanaCall | SolanaCall[]
      chain: SolanaChain
    }
  | {
      type: CallType.Sui
      call: SuiCall
      chain: SuiChain
    }
  | {
      type: CallType.Substrate
      call: SubstrateCall
      chain: Parachain
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

  if (isSuiChain(toChain)) {
    const suiClaim = new SuiClaim(toChain)
    return {
      type: CallType.Sui,
      call: await suiClaim.redeem(claimerAddress, vaaRaw),
      chain: toChain,
    }
  }

  if (isAnyParachain(toChain)) {
    const moonbeam = chainsMap.get("moonbeam")
    if (!moonbeam || !isEvmParachain(moonbeam)) return undefined

    const substrateClaim = new SubstrateClaim(moonbeam)
    return {
      type: CallType.Substrate,
      call: await substrateClaim.redeemMrlViaXcm(claimerAddress, vaaRaw),
      chain: toChain,
    }
  }

  return undefined
}
