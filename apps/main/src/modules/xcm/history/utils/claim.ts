import {
  EvmAddr,
  getVaaHeader,
  isAnyParachain,
  isEvmChain,
  isEvmParachain,
  isSolanaChain,
  isSuiChain,
  safeParse,
  SolanaAddr,
} from "@galacticcouncil/utils"
import {
  assetsMap,
  chainsMap,
  HydrationConfigService,
  routesMap,
} from "@galacticcouncil/xc-cfg"
import {
  AnyChain,
  CallType,
  ChainEcosystem,
  EvmChain,
  EvmParachain,
  Ntt,
  NttTokenDef,
  SolanaChain,
  SuiChain,
  Wormhole,
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
import {
  addMilliseconds,
  fromUnixTime,
  hoursToMilliseconds,
  isWithinInterval,
  minutesToMilliseconds,
} from "date-fns"
import { isString } from "remeda"

import {
  getTransferAsset,
  resolveNetwork,
} from "@/modules/xcm/history/utils/assets"
import {
  XcJourneyStop,
  XcJourneyWhStop,
} from "@/modules/xcm/history/utils/journey"

const CLAIM_MIN_AGE_MS = minutesToMilliseconds(5) // 5 minutes
const CLAIM_MAX_AGE_MS = hoursToMilliseconds(24) * 7 * 2 // 2 weeks

function isWithinClaimWindow(emittedAtSeconds: number) {
  const emittedAt = fromUnixTime(emittedAtSeconds)

  return isWithinInterval(new Date(), {
    start: addMilliseconds(emittedAt, CLAIM_MIN_AGE_MS),
    end: addMilliseconds(emittedAt, CLAIM_MAX_AGE_MS),
  })
}

export function isJourneyClaimable(journey: XcJourney): boolean {
  const vaaHeader = getJourneyVaaHeader(journey)
  if (!vaaHeader) return false

  const toChain = resolveChainFromUrn(journey.destination)
  if (!toChain) return false

  const asset = getTransferAsset(journey)
  if (!asset) return false

  // Without a registered NTT deployment on the destination there is nothing
  // to redeem against, so don't offer a claim that can't be built.
  if (!resolveNttDeployment(journey, toChain)) return false

  return isWithinClaimWindow(vaaHeader.timestamp)
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

// Static registry view — same maps the SDK's own config is built from. The
// pool context `createXcContext` additionally wires in only feeds dex
// routing, which asset & route lookups don't touch.
const configService = new HydrationConfigService({
  assets: assetsMap,
  chains: chainsMap,
  routes: routesMap,
})

/**
 * VAA emitter in the format the source chain's NTT registry stores it.
 *
 * The header carries the raw 32 bytes, which each platform records
 * differently: evm as a 20 byte address the vaa zero-pads, solana as a base58
 * pubkey (the transceiver's pda), sui as the full 32 byte EmitterCap object
 * id. Keyed off the chain rather than the byte shape — a sui object id can
 * lead with zeros and must not be truncated into an evm address.
 */
function toRegistryEmitter(chain: AnyChain, emitterAddress: string): string {
  if (Wormhole.fromChain(chain).platformAddressFormat === "base58") {
    return SolanaAddr.encodePubKey(`0x${emitterAddress}`)
  }

  if (isEvmChain(chain) || isEvmParachain(chain)) {
    return `0x${emitterAddress.slice(-40)}`
  }

  return `0x${emitterAddress}`
}

export function findChainByWormholeId(
  wormholeId: number,
): AnyChain | undefined {
  return chainsMap
    .values()
    .find(
      (c) =>
        Wormhole.isKnown(c) &&
        Wormhole.fromChain(c).getWormholeId() === wormholeId,
    )
}

/**
 * NTT deployment of the transferred token on the destination chain.
 *
 * The emitter identifies the token by its key on the *source* chain, which is
 * not necessarily the key it carries on the destination (`dai` on ethereum,
 * `dai_mwh` on hydration). The registered route holds that mapping, so
 * resolve through it when the key doesn't carry over.
 */
function findDestinationNtt(
  source: { chain: AnyChain; assetKey: string },
  toChain: AnyChain,
): NttTokenDef | undefined {
  const direct = Ntt.find(toChain, source.assetKey)
  if (direct) return direct

  const asset = configService.assets.get(source.assetKey)
  if (!asset) return undefined

  const routes = configService.getAssetRoutesOrEmpty(
    asset,
    source.chain,
    toChain,
  )

  for (const route of routes) {
    const def = Ntt.find(toChain, route.destination.asset.key)
    if (def) return def
  }

  return undefined
}

/**
 * NTT deployment needed to redeem a journey on its destination chain.
 *
 * Mirrors the SDK's WormholeTransfer: the VAA emitter identifies the source
 * deployment along with its asset key, which then resolves to the matching
 * deployment on the destination.
 */
export function resolveNttDeployment(
  journey: XcJourney,
  toChain: AnyChain,
): NttTokenDef | undefined {
  const header = getJourneyVaaHeader(journey)
  if (!header) return

  const fromChain = findChainByWormholeId(header.emitterChain)
  if (!fromChain) return

  const source = Ntt.findByEmitter(
    fromChain,
    toRegistryEmitter(fromChain, header.emitterAddress),
  )
  if (!source) return

  return findDestinationNtt(
    { chain: fromChain, assetKey: source.assetKey },
    toChain,
  )
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
  | { type: CallType.Evm; call: EvmCall; chain: EvmChain | EvmParachain }
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
      chain: EvmParachain
    }

export async function buildClaimCall(
  journey: XcJourney,
  claimerAddress: string,
): Promise<ClaimCallResult | undefined> {
  const vaaRaw = getJourneyVaaRaw(journey)
  const toChain = resolveChainFromUrn(journey.destination)
  if (!vaaRaw || !toChain) return undefined

  const ntt = resolveNttDeployment(journey, toChain)
  if (!ntt) return undefined

  if (isSolanaChain(toChain)) {
    const solanaClaim = new SolanaClaim(toChain)
    return {
      type: CallType.Solana,
      call: await solanaClaim.redeem(claimerAddress, vaaRaw, ntt),
      chain: toChain,
    }
  }

  if (isSuiChain(toChain)) {
    const suiClaim = new SuiClaim(toChain)
    return {
      type: CallType.Sui,
      call: await suiClaim.redeem(claimerAddress, vaaRaw, ntt),
      chain: toChain,
    }
  }

  // A substrate signed origin can't sign evm txs, so the same claim goes out
  // wrapped in an EVM.call extrinsic on the destination parachain.
  if (!EvmAddr.isValid(claimerAddress) && isEvmParachain(toChain)) {
    const substrateClaim = await SubstrateClaim.create(toChain)
    return {
      type: CallType.Substrate,
      call: await substrateClaim.redeem(claimerAddress, vaaRaw, ntt),
      chain: toChain,
    }
  }

  if (isEvmChain(toChain) || isEvmParachain(toChain)) {
    const evmClaim = new EvmClaim()
    return {
      type: CallType.Evm,
      call: evmClaim.redeem(claimerAddress, vaaRaw, ntt),
      chain: toChain,
    }
  }

  return undefined
}
