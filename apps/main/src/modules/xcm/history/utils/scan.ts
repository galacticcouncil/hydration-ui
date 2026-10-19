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
 * Chains of the transfers xc-scan doesn't index, as the scan names them. A utxo
 * transfer carries its ntt leg, so the leg isn't listed on its own.
 */
export const SCAN_ONLY_CHAINS = [NEAR_CHAIN_KEY, "zcash"]

// The scan names Zcash's chain after the network, xc-cfg after its coin
const SCAN_CHAIN_KEYS: Record<string, string> = { zcash: "zec" }

const getScanChain = (name: string) =>
  chainsMap.get(SCAN_CHAIN_KEYS[name] ?? name)

/**
 * Hydration id of the token a NEAR or Zcash transfer moves: one of those
 * hydration shares with NEAR over ntt, which logos are keyed by.
 */
const getNearNttAssetId = (symbol: string) => {
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  if (
    !hydration ||
    !near ||
    !Wormhole.isKnown(hydration) ||
    !Wormhole.isKnown(near)
  ) {
    return
  }

  const nearNtt = Wormhole.fromChain(near).ntt
  const asset = Object.keys(Wormhole.fromChain(hydration).ntt)
    .filter((assetKey) => !!nearNtt[assetKey])
    .map((assetKey) => assetsMap.get(assetKey))
    .find((asset) => asset?.originSymbol === symbol)

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

  return {
    id: 0,
    correlationId: `${SCAN_JOURNEY_PREFIX}${transfer.id}`,
    status: toJourneyStatus(transfer, vaa),
    type: "transfer",
    originProtocol: "wh_ntt",
    destinationProtocol: "wh_ntt",
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
        asset: `${getChainXcScanUrn(hydration)}|${getNearNttAssetId(transfer.symbol) ?? ""}`,
        symbol: transfer.symbol,
        amount: transfer.amount,
        decimals: transfer.decimals ?? undefined,
        role: "transfer",
      },
    ],
  }
}
