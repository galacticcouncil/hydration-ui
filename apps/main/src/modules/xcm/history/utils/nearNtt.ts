import {
  EvmAddr,
  getChainAssetId,
  getVaaHeader,
  HYDRATION_CHAIN_KEY,
  isNearChain,
  isZecChain,
  NearAddr,
  safeConvertSS58toH160,
  Ss58Addr,
} from "@galacticcouncil/utils"
import { assetsMap, chainsMap, clients } from "@galacticcouncil/xc-cfg"
import { AnyChain, Wormhole } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { secondsToMilliseconds } from "date-fns"
import { bytesToHex } from "viem"

import {
  getChainXcScanUrn,
  NEAR_CHAIN_KEY,
  WORMHOLESCAN_JOURNEY_PREFIX,
  XcJourneyWhStop,
} from "@/modules/xcm/history/utils/journey"

const TRANSCEIVER_PREFIX = "0x9945ff10"
const NTT_PREFIX = "0x994e5454"

// A wormhole transceiver message: prefix (4), source and recipient managers
// (32 each) and the manager message's length (2), then that message: id (32),
// sender (32), payload length (2) and the transfer: prefix (4), decimals (1),
// amount (8), source token (32), recipient (32), recipient chain (2)
const SENDER = 4 + 32 + 32 + 2 + 32
const TRANSFER = SENDER + 32 + 2
const TRANSFER_LENGTH = 4 + 1 + 8 + 32 + 32 + 2

/** An ntt transfer, its parties as 32-byte universal addresses. */
export type NttTransfer = {
  sender: string
  to: string
  toChain: number
  /** Trimmed to `decimals`, as ntt carries it. */
  amount: bigint
  decimals: number
}

/** Where NEAR ntt transfers are emitted, one per token and direction. */
export type NearNttSource = {
  /** Wormhole chain id of the emitter. */
  emitterChain: number
  /** 32-byte hex, without 0x, as Wormholescan takes it. */
  emitter: string
  assetKey: string
  from: AnyChain
  to: AnyChain
}

/** A vaa as Wormholescan lists it. */
export type WormholescanVaa = {
  sequence: number
  /** Base64. */
  vaa: string
  guardianSetIndex: number
  isDuplicated?: boolean
}

type NearNttAccount = {
  address: string
  /** The address as `toNearNttParty` gives it. */
  party: string
}

/** The ntt transfer a wormhole transceiver message carries, if it is one. */
export const parseNttTransfer = (
  payload: Uint8Array,
): NttTransfer | undefined => {
  if (payload.length < TRANSFER + TRANSFER_LENGTH) return
  if (bytesToHex(payload.subarray(0, 4)) !== TRANSCEIVER_PREFIX) return
  if (bytesToHex(payload.subarray(TRANSFER, TRANSFER + 4)) !== NTT_PREFIX) {
    return
  }

  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength,
  )

  return {
    sender: bytesToHex(payload.subarray(SENDER, SENDER + 32)),
    decimals: view.getUint8(TRANSFER + 4),
    amount: view.getBigUint64(TRANSFER + 5),
    to: bytesToHex(payload.subarray(TRANSFER + 45, TRANSFER + 77)),
    toChain: view.getUint16(TRANSFER + 77),
  }
}

/**
 * The emitters of every token hydration and NEAR share over ntt: hydration's
 * transceiver one way, the NEAR contract the other.
 */
export const getNearNttSources = (): NearNttSource[] => {
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  if (
    !hydration ||
    !near ||
    !Wormhole.isKnown(hydration) ||
    !Wormhole.isKnown(near)
  ) {
    return []
  }

  const hydrationWh = Wormhole.fromChain(hydration)
  const nearWh = Wormhole.fromChain(near)

  return Object.entries(hydrationWh.ntt).flatMap(([assetKey, def]) => {
    const peer = nearWh.ntt[assetKey]
    if (!peer?.emitter) return []

    return [
      {
        emitterChain: hydrationWh.getWormholeId(),
        emitter: hydrationWh
          .normalizeAddress(def.transceiver.wormhole)
          .slice(2),
        assetKey,
        from: hydration,
        to: near,
      },
      {
        emitterChain: nearWh.getWormholeId(),
        emitter: peer.emitter.slice(2).toLowerCase(),
        assetKey,
        from: near,
        to: hydration,
      },
    ]
  })
}

/** How ntt names a NEAR account: the hash of its id. */
export const toNearUniversal = (accountId: string): string | undefined => {
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  return near ? Wormhole.fromChain(near).normalizeAddress(accountId) : undefined
}

/**
 * The universal address an account takes in a NEAR ntt transfer: its evm
 * address on hydration, the hash of its id on NEAR.
 */
export const toNearNttParty = (address: string): string | undefined => {
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  if (!hydration) return

  if (EvmAddr.isValid(address)) {
    return Wormhole.fromChain(hydration).normalizeAddress(address)
  }
  if (Ss58Addr.isValid(address)) {
    const h160 = safeConvertSS58toH160(address)
    return Wormhole.fromChain(hydration).normalizeAddress(h160)
  }
  if (NearAddr.isValid(address)) {
    return toNearUniversal(address)
  }
}

/** NEAR account Omni's Zcash connector sends deposits from. */
const getZcashConnectorAccount = (near: AnyChain, zcash: AnyChain) =>
  isNearChain(near)
    ? clients.omniClient(zcash, near).connector.account
    : undefined

const toChainAddress = (chain: AnyChain, universal: string) =>
  chain.key === HYDRATION_CHAIN_KEY ? `0x${universal.slice(-40)}` : universal

/**
 * A NEAR ntt transfer as a journey, where the account is a party to it.
 *
 * - Built `waiting`, the status the claim code reads a vaa from; the caller
 *   marks the redeemed ones
 * - A NEAR party is the hash of its id, so only the account's own id shows
 * - A deposit the Omni connector sends was paid on Zcash
 */
export const toNearNttJourney = (
  vaa: WormholescanVaa,
  source: NearNttSource,
  { address, party }: NearNttAccount,
): XcJourney | undefined => {
  const header = getVaaHeader(vaa.vaa)
  const transfer = parseNttTransfer(header.payload)
  if (!transfer || (transfer.sender !== party && transfer.to !== party)) return

  const asset = assetsMap.get(source.assetKey)
  if (!asset) return

  const zcash = chainsMap.values().find(isZecChain)
  const connector =
    zcash && source.from.key === NEAR_CHAIN_KEY
      ? getZcashConnectorAccount(source.from, zcash)
      : undefined
  const isPaidOnZcash =
    !!zcash &&
    !!connector &&
    transfer.sender ===
      Wormhole.fromChain(source.from).normalizeAddress(connector)

  const origin = getChainXcScanUrn(isPaidOnZcash ? zcash : source.from)
  const destination = getChainXcScanUrn(source.to)
  const sentAt = secondsToMilliseconds(header.timestamp)
  const toName = (universal: string) =>
    universal === party ? address : undefined

  const stop: XcJourneyWhStop = {
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
  }

  return {
    id: 0,
    correlationId: `${WORMHOLESCAN_JOURNEY_PREFIX}${source.emitterChain}/${source.emitter}/${vaa.sequence}`,
    status: "waiting",
    type: "transfer",
    originProtocol: "wh_ntt",
    destinationProtocol: "wh_ntt",
    origin,
    destination,
    from: toChainAddress(source.from, transfer.sender),
    fromFormatted:
      source.from.key === NEAR_CHAIN_KEY ? toName(transfer.sender) : undefined,
    to: toChainAddress(source.to, transfer.to),
    toFormatted:
      source.to.key === NEAR_CHAIN_KEY ? toName(transfer.to) : undefined,
    sentAt,
    createdAt: sentAt,
    stops: JSON.stringify([stop]),
    instructions: "",
    transactCalls: "",
    totalUsd: 0,
    assets: [
      {
        asset: `${destination}|${getChainAssetId(source.to, asset)}`,
        symbol: asset.originSymbol,
        amount: transfer.amount.toString(),
        decimals: transfer.decimals,
        role: "transfer",
      },
    ],
  }
}
