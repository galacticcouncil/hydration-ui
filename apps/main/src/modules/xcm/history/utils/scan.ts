import type { ScanTransfer } from "@galacticcouncil/indexer/scan"
import {
  EvmAddr,
  getChainAssetId,
  HYDRATION_CHAIN_KEY,
  NearAddr,
  safeConvertSS58toH160,
  Ss58Addr,
} from "@galacticcouncil/utils"
import { assetsMap, chainsMap } from "@galacticcouncil/xc-cfg"
import { Wormhole } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { isNonNullish } from "remeda"

import type { WormholeVaa } from "@/api/wormhole"

import {
  getChainXcScanUrn,
  NEAR_CHAIN_KEY,
  SCAN_JOURNEY_PREFIX,
  TJourneyStatus,
  XcJourneyWhStop,
} from "./journey"
import { toNearUniversal } from "./nearNtt"

/**
 * Chains whose legs come only from the scan, as it names them. xc-scan times
 * NEAR's to the second and files a Zcash deposit as its NEAR leg, so neither
 * matches the scan's; a utxo transfer carries its ntt leg.
 */
export const SCAN_ONLY_CHAINS = [NEAR_CHAIN_KEY, "zcash"]

// The rails the scan indexes, as xc-scan names their journeys
const SCAN_PROTOCOLS = ["wh_ntt", "basejump"]

// The scan names Zcash's chain after the network, xc-cfg after its coin
const SCAN_CHAIN_KEYS: Record<string, string> = { zcash: "zec" }

const getScanChain = (name: string) =>
  chainsMap.get(SCAN_CHAIN_KEYS[name] ?? name)

const SCAN_ONLY_URNS: string[] = SCAN_ONLY_CHAINS.map(getScanChain)
  .filter(isNonNullish)
  .map(getChainXcScanUrn)

const isScanChainJourney = (journey: XcJourney): boolean =>
  SCAN_ONLY_URNS.includes(journey.origin) ||
  SCAN_ONLY_URNS.includes(journey.destination)

// Both take a transfer's time from its source block
const toTwinKey = (journey: XcJourney) =>
  `${journey.origin}>${journey.destination}@${journey.sentAt}`

/**
 * xc-scan's journeys less those the scan lists too: its NEAR and Zcash legs,
 * and any ntt or Basejump one the scan has on the same route at the same time.
 */
export const withoutScanTwins = (
  journeys: XcJourney[],
  scanJourneys: XcJourney[],
): XcJourney[] => {
  const twins = new Set(scanJourneys.map(toTwinKey))

  return journeys.filter(
    (journey) =>
      !isScanChainJourney(journey) &&
      !(
        SCAN_PROTOCOLS.includes(journey.originProtocol) &&
        twins.has(toTwinKey(journey))
      ),
  )
}

/**
 * Hydration id of the token a transfer moves, which logos are keyed by: the
 * one of hydration's ntt tokens with its symbol, unique among them.
 */
const getNttAssetId = (symbol: string) => {
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  if (!hydration || !Wormhole.isKnown(hydration)) return

  // xc-cfg and the scan differ on case for some, e.g. JitoSOL
  const asset = Object.keys(Wormhole.fromChain(hydration).ntt)
    .map((assetKey) => assetsMap.get(assetKey))
    .find((asset) => asset?.originSymbol.toLowerCase() === symbol.toLowerCase())

  return asset && getChainAssetId(hydration, asset)
}

/**
 * How the scan finds an account: on hydration by its evm address, anywhere
 * else (a NEAR id, a Zcash address) as it is.
 */
export const toScanAccount = (address: string): string =>
  Ss58Addr.isValid(address) && !EvmAddr.isValid(address)
    ? safeConvertSS58toH160(address)
    : address

/**
 * The hash a NEAR account goes by in a transfer to it, which is all the scan
 * shows of it until the transfer is redeemed.
 */
export const toScanNearHash = (address: string): string | undefined => {
  // An Ethereum wallet's account on NEAR is its evm address, in lowercase
  const accountId = EvmAddr.isValid(address) ? address.toLowerCase() : address

  return NearAddr.isValid(accountId) && !Ss58Addr.isValid(accountId)
    ? toNearUniversal(accountId)
    : undefined
}

export const isScanTransferInFlight = (transfer: ScanTransfer): boolean =>
  transfer.status === "pending" || transfer.status === "held"

const toJourneyStatus = (
  transfer: ScanTransfer,
  vaa?: WormholeVaa,
): TJourneyStatus => {
  // The status the claim code reads a vaa from
  if (vaa) return "waiting"

  switch (transfer.status) {
    case "completed":
      return "received"
    case "failed":
      return "failed"
    default:
      return "sent"
  }
}

/**
 * A scan transfer as a journey. Given an unredeemed leg's vaa it is `waiting`,
 * for the claim code, and a withdrawal heads to NEAR, where the leg is claimed.
 */
export const toScanJourney = (
  transfer: ScanTransfer,
  vaa?: WormholeVaa,
): XcJourney | undefined => {
  const isClaimedOnNear = !!vaa && transfer.type === "withdraw"
  const fromChain = getScanChain(transfer.from_chain)
  const toChain = getScanChain(
    isClaimedOnNear ? NEAR_CHAIN_KEY : transfer.to_chain,
  )
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  if (!fromChain || !toChain || !hydration) return

  const stops: XcJourneyWhStop[] = vaa
    ? [
        {
          type: "wormhole",
          from: {},
          to: {},
          instructions: {
            type: "WormholeVAA",
            value: {
              raw: vaa.vaa,
              guardianSetIndex: vaa.guardianSetIndex,
              isDuplicated: !!vaa.isDuplicated,
            },
          },
        },
      ]
    : []

  // Labelled as xc-scan labels them
  const protocol = transfer.kind === "basejump" ? "basejump" : "wh_ntt"

  return {
    id: 0,
    correlationId: `${SCAN_JOURNEY_PREFIX}${transfer.id}`,
    status: toJourneyStatus(transfer, vaa),
    type: "transfer",
    originProtocol: protocol,
    destinationProtocol: protocol,
    origin: getChainXcScanUrn(fromChain),
    destination: getChainXcScanUrn(toChain),
    from: transfer.from_address,
    fromFormatted: transfer.from_address,
    to: transfer.to_address,
    toFormatted: transfer.to_address,
    sentAt: transfer.time,
    createdAt: transfer.time,
    stops: JSON.stringify(stops),
    instructions: "",
    transactCalls: "",
    totalUsd: 0,
    assets: [
      {
        asset: `${getChainXcScanUrn(hydration)}|${getNttAssetId(transfer.symbol) ?? ""}`,
        symbol: transfer.symbol,
        amount: transfer.amount,
        decimals: transfer.decimals ?? undefined,
        role: "transfer",
      },
    ],
  }
}
