import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  EvmAddr,
  getVaaHeader,
  isAnyParachain,
  isEvmChain,
  isEvmParachain,
  isSolanaChain,
  isSuiChain,
  safeConvertSS58toH160,
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
  Gas,
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
  SuiCall,
  SuiClaim,
} from "@galacticcouncil/xc-sdk"
import { addMilliseconds, fromUnixTime, hoursToMilliseconds } from "date-fns"
import { isString } from "remeda"
import { Hex, parseAbi } from "viem"

import {
  getTransferAsset,
  resolveNetwork,
} from "@/modules/xcm/history/utils/assets"
import {
  XcJourneyStop,
  XcJourneyWhStop,
} from "@/modules/xcm/history/utils/journey"

const CLAIM_MIN_AGE_MS = 60_000 // 1 minute
const CLAIM_MAX_AGE_MS = hoursToMilliseconds(24) * 7 * 2 // 2 weeks

function isBeforeClaimExpiry(emittedAtSeconds: number) {
  const emittedAt = fromUnixTime(emittedAtSeconds)

  return Date.now() <= addMilliseconds(emittedAt, CLAIM_MAX_AGE_MS).getTime()
}

function isWithinClaimWindow(emittedAtSeconds: number, nowMs = Date.now()) {
  const emittedAt = fromUnixTime(emittedAtSeconds)

  return (
    nowMs >= addMilliseconds(emittedAt, CLAIM_MIN_AGE_MS).getTime() &&
    nowMs <= addMilliseconds(emittedAt, CLAIM_MAX_AGE_MS).getTime()
  )
}

function getClaimContext(journey: XcJourney) {
  const vaaHeader = getJourneyVaaHeader(journey)
  if (!vaaHeader) return undefined

  const toChain = resolveChainFromUrn(journey.destination)
  if (!toChain) return undefined

  const asset = getTransferAsset(journey)
  if (!asset) return undefined

  // Without a registered NTT deployment on the destination there is nothing
  // to redeem against, so don't offer a claim that can't be built.
  if (!resolveNttDeployment(journey, toChain)) return undefined

  return { vaaHeader, toChain, asset }
}

export function getJourneyClaimReadyAt(journey: XcJourney): number | undefined {
  const vaaHeader = getJourneyVaaHeader(journey)
  if (!vaaHeader) return undefined

  return addMilliseconds(
    fromUnixTime(vaaHeader.timestamp),
    CLAIM_MIN_AGE_MS,
  ).getTime()
}

export function isJourneyClaimReady(
  journey: XcJourney,
  now = new Date(),
): boolean {
  const readyAt = getJourneyClaimReadyAt(journey)
  return readyAt !== undefined && now.getTime() >= readyAt
}

export function isJourneyPendingClaim(journey: XcJourney): boolean {
  const ctx = getClaimContext(journey)
  if (!ctx) return false

  return isBeforeClaimExpiry(ctx.vaaHeader.timestamp)
}

export function isJourneyClaimable(
  journey: XcJourney,
  nowMs = Date.now(),
): boolean {
  const ctx = getClaimContext(journey)
  if (!ctx) return false

  return isWithinClaimWindow(ctx.vaaHeader.timestamp, nowMs)
}

export function isJourneyAwaitingMinAge(
  journey: XcJourney,
  nowMs = Date.now(),
): boolean {
  if (!isJourneyPendingClaim(journey)) return false

  const readyAt = getJourneyClaimReadyAt(journey)
  return readyAt !== undefined && nowMs < readyAt
}

export function getClaimableJourneys(
  journeys: XcJourney[],
  nowMs = Date.now(),
) {
  return journeys.filter((journey) => isJourneyClaimable(journey, nowMs))
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

function findChainByWormholeId(wormholeId: number): AnyChain | undefined {
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
 * Asset key of the deployment that signed the VAA on the source chain.
 *
 * `Ntt.findByEmitter` matches `emitter ?? transceiver.wormhole`, so a
 * registered `emitter` shadows the transceiver. Solana deployments record one
 * that has never signed a VAA — every solana transfer is emitted by the
 * transceiver itself — so match on either address.
 */
function findSourceAssetKey(
  chain: AnyChain,
  emitter: string,
): string | undefined {
  const { ntt } = Wormhole.fromChain(chain)
  const target = emitter.toLowerCase()

  const entry = Object.entries(ntt).find(([, def]) =>
    [def.emitter, def.transceiver.wormhole].some(
      (address) => address?.toLowerCase() === target,
    ),
  )

  return entry?.[0]
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

  const assetKey = findSourceAssetKey(
    fromChain,
    toRegistryEmitter(fromChain, header.emitterAddress),
  )
  if (!assetKey) return

  return findDestinationNtt({ chain: fromChain, assetKey }, toChain)
}

const wormholeTransceiverAbi = parseAbi([
  "function isVAAConsumed(bytes32 hash) view returns (bool)",
])

/**
 * Whether the destination has already consumed this journey's VAA.
 */
export async function isJourneyRedeemed(journey: XcJourney): Promise<boolean> {
  const header = getJourneyVaaHeader(journey)
  if (!header) return false

  const toChain = resolveChainFromUrn(journey.destination)
  if (!toChain) return false
  if (!isEvmChain(toChain) && !isEvmParachain(toChain)) return false

  const ntt = resolveNttDeployment(journey, toChain)
  if (!ntt) return false

  return toChain.evmClient.getProvider().readContract({
    abi: wormholeTransceiverAbi,
    address: ntt.transceiver.wormhole as Hex,
    functionName: "isVAAConsumed",
    args: [`0x${header.id}`],
  })
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
      call: ExtendedEvmCall
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
    const source = safeConvertSS58toH160(claimerAddress)
    const evmCall = new EvmClaim().redeem(source, vaaRaw, ntt)
    const gasPrice = await toChain.evmClient.getProvider().getGasPrice()

    return {
      type: CallType.Substrate,
      call: {
        ...evmCall,
        gasLimit: Gas.redeem,
        maxFeePerGas: gasPrice + gasPrice / 10n,
      },
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
