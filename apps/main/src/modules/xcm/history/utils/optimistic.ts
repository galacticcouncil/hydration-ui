import {
  getChainAssetId,
  HYDRATION_CHAIN_KEY,
  isEvmParachainAccount,
  safeConvertSS58toH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import type { Transfer } from "@galacticcouncil/xc-sdk"
import type { QueryClient } from "@tanstack/react-query"

import { createXcScanQueryKey } from "@/modules/xcm/history/useXcScan"
import {
  getChainXcScanUrn,
  journeyDate,
} from "@/modules/xcm/history/utils/journey"
import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmTag } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const OPTIMISTIC_JOURNEY_PREFIX = "optimistic:"

const MATCH_WINDOW_MS = 5 * 60 * 1000

const ASSETHUB_KUSAMA_CHAIN_KEY = "assethub_kusama"
const HYDRATION_URN = "urn:ocn:polkadot:2034"
const ASSETHUB_KUSAMA_URN = "urn:ocn:kusama:1000"

export function isOptimisticJourney(journey: XcJourney): boolean {
  return journey.correlationId.startsWith(OPTIMISTIC_JOURNEY_PREFIX)
}

function isCanonical(journey: XcJourney): boolean {
  return !journey.originTxPrimary && !journey.originTxSecondary
}

function txHashes(journey: XcJourney): string[] {
  return [journey.originTxPrimary, journey.originTxSecondary].filter(
    (hash): hash is string => !!hash,
  )
}

function sharesTxHash(a: XcJourney, b: XcJourney): boolean {
  const hashes = txHashes(b)
  return txHashes(a).some((hash) => hashes.includes(hash))
}

function isOptimisticFor(journey: XcJourney, txHash: string): boolean {
  return isOptimisticJourney(journey) && txHashes(journey).includes(txHash)
}

/* -------------------------------------------------------------------------
 * Hop routes
 *
 * Hydration <-> AssetHub Kusama transfers reach us twice: first as a leg
 * carrying the origin tx hash, then as the canonical journey carrying none.
 * Remembering the tx hash of an in-flight hop lets the canonical journey
 * replace its leg, and lets a late leg be ignored.
 * ---------------------------------------------------------------------- */

const hopTxAt = new Map<string, number>()

const hopKey = (address: string, txHash: string) => `${address}:${txHash}`

function trackHopTx(address: string, txHash: string) {
  hopTxAt.set(hopKey(address, txHash), Date.now())
}

function forgetHopTx(address: string, txHash: string) {
  hopTxAt.delete(hopKey(address, txHash))
}

function isHopTx(address: string, txHash?: string): boolean {
  if (!txHash) return false

  const key = hopKey(address, txHash)
  const trackedAt = hopTxAt.get(key)

  if (trackedAt === undefined) return false
  if (Date.now() - trackedAt <= MATCH_WINDOW_MS) return true

  hopTxAt.delete(key)
  return false
}

function isHopRoute(srcChain?: AnyChain | null, destChain?: AnyChain | null) {
  const keys = [srcChain?.key, destChain?.key]
  return (
    keys.includes(HYDRATION_CHAIN_KEY) &&
    keys.includes(ASSETHUB_KUSAMA_CHAIN_KEY)
  )
}

function isHopJourney(journey: XcJourney): boolean {
  const urns = [journey.origin, journey.destination]
  return urns.includes(HYDRATION_URN) && urns.includes(ASSETHUB_KUSAMA_URN)
}

function replaces(
  incoming: XcJourney,
  item: XcJourney,
  address: string,
): boolean {
  // Same journey, pushed again.
  if (incoming.correlationId === item.correlationId) return true

  // The real journey behind an optimistic placeholder.
  if (isOptimisticJourney(item) && sharesTxHash(item, incoming)) return true

  // Same transfer, re-emitted under a new correlation id.
  if (
    !!incoming.originTxPrimary &&
    incoming.originTxPrimary === item.originTxPrimary
  ) {
    return true
  }

  // Canonical hop journey superseding the leg stored before it.
  return isCanonical(incoming) && isHopTx(address, item.originTxPrimary)
}

/**
 * Wormhole NTT journeys arrive under a tx hash we never saw, so their
 * placeholder is matched on route, parties, amount and time instead — and
 * only when exactly one candidate fits.
 */
function findWormholeTwin(list: XcJourney[], incoming: XcJourney) {
  if (incoming.originProtocol !== "wh_ntt") return undefined

  const matches = list.filter((item) => isSameTransfer(item, incoming))
  return matches.length === 1 ? matches[0] : undefined
}

function isSameTransfer(optimistic: XcJourney, incoming: XcJourney): boolean {
  if (!isOptimisticJourney(optimistic)) return false
  if (optimistic.origin !== incoming.origin) return false
  if (optimistic.destination !== incoming.destination) return false

  const sameSender =
    stringEquals(optimistic.from, incoming.from) ||
    stringEquals(safeConvertSS58toH160(optimistic.from), incoming.from)

  const sameRecipient =
    stringEquals(optimistic.to, incoming.to) ||
    (!!optimistic.toFormatted &&
      !!incoming.toFormatted &&
      stringEquals(optimistic.toFormatted, incoming.toFormatted))

  const sameTime =
    Math.abs(journeyDate(optimistic) - journeyDate(incoming)) <= MATCH_WINDOW_MS

  const sameAsset = optimistic.assets.some((asset) =>
    incoming.assets.some(
      (other) =>
        asset.symbol === other.symbol &&
        asset.amount === other.amount &&
        asset.decimals === other.decimals,
    ),
  )

  return sameSender && sameRecipient && sameTime && sameAsset
}

function findReplaced(
  list: XcJourney[],
  incoming: XcJourney,
  address: string,
): XcJourney[] {
  const replaced = list.filter((item) => replaces(incoming, item, address))
  if (replaced.some(isOptimisticJourney)) return replaced

  const twin = findWormholeTwin(list, incoming)
  return twin ? [...replaced, twin] : replaced
}

function isIgnored(
  list: XcJourney[],
  incoming: XcJourney,
  address: string,
): boolean {
  // Hop leg arriving after its canonical journey.
  return (
    isHopTx(address, incoming.originTxPrimary) &&
    list.some((item) => isCanonical(item) && isHopJourney(item))
  )
}

function resolveHopTxs(
  address: string,
  incoming: XcJourney,
  replaced: XcJourney[],
) {
  if (!isCanonical(incoming)) return

  for (const item of replaced) {
    if (item.originTxPrimary) forgetHopTx(address, item.originTxPrimary)
  }
}

function dedupe(list: XcJourney[], address: string): XcJourney[] {
  return list.filter((item, index) => {
    const replacedBy = list.find((other, otherIndex) => {
      if (otherIndex === index || !replaces(other, item, address)) return false
      // Both replace each other — keep the one listed first.
      return replaces(item, other, address) ? otherIndex < index : true
    })

    if (replacedBy) resolveHopTxs(address, replacedBy, [item])

    return !replacedBy
  })
}

export function addJourney(
  list: XcJourney[],
  incoming: XcJourney,
  address: string,
): XcJourney[] {
  if (isIgnored(list, incoming, address)) return list

  const replaced = findReplaced(list, incoming, address)
  resolveHopTxs(address, incoming, replaced)

  return [incoming, ...list.filter((item) => !replaced.includes(item))]
}

export function mergeLoadedJourneys(
  previous: XcJourney[] | undefined,
  loaded: XcJourney[],
  address: string,
): XcJourney[] {
  const optimistic = (previous ?? []).filter(isOptimisticJourney)
  const replaced = new Set(
    loaded.flatMap((journey) => findReplaced(optimistic, journey, address)),
  )
  const surviving = optimistic.filter((journey) => !replaced.has(journey))

  return dedupe([...surviving, ...loaded], address)
}

function toOptimisticJourney(
  values: XcmFormValues,
  transfer: Transfer,
  txHash: string,
  fromAddress: string,
): XcJourney | undefined {
  const { srcChain, destChain, srcAsset, destAmount, destAddress } = values
  const decimals = transfer.source.balance.decimals
  const now = Date.now()

  if (!srcAsset || !srcChain || !destChain) return

  const assetId = getChainAssetId(srcChain, srcAsset).toString()
  const originUrn = getChainXcScanUrn(srcChain)
  const destinationUrn = getChainXcScanUrn(destChain)

  const from = isEvmParachainAccount(fromAddress)
    ? safeConvertSS58toH160(fromAddress)
    : fromAddress

  const protocol =
    values.bridgeProvider === XcmTag.Basejump ? "basejump" : "xcm"

  return {
    id: 0,
    correlationId: `${OPTIMISTIC_JOURNEY_PREFIX}${txHash}`,
    status: "pending",
    type: "transfer",
    originProtocol: protocol,
    destinationProtocol: protocol,
    origin: originUrn,
    destination: destinationUrn,
    from,
    fromFormatted: fromAddress,
    to: destAddress,
    toFormatted: destAddress,
    sentAt: now,
    createdAt: now,
    stops: "",
    instructions: "",
    transactCalls: "",
    originTxPrimary: txHash,
    totalUsd: 0,
    assets: [
      {
        asset: `${originUrn}|${assetId}`,
        symbol: srcAsset?.originSymbol ?? "",
        amount: scale(destAmount, decimals),
        decimals,
        role: "transfer",
      },
    ],
  } satisfies XcJourney
}

export function insertOptimisticJourney(
  queryClient: QueryClient,
  address: string,
  txHash: string,
  values: XcmFormValues,
  transfer: Transfer,
) {
  const queryKey = createXcScanQueryKey(address)
  const list = queryClient.getQueryData<XcJourney[]>(queryKey) ?? []

  if (list.some((journey) => isOptimisticFor(journey, txHash))) return

  const journey = toOptimisticJourney(values, transfer, txHash, address)
  if (!journey) return

  if (isHopRoute(values.srcChain, values.destChain)) {
    trackHopTx(address, txHash)
  }

  queryClient.setQueryData<XcJourney[]>(queryKey, (old) => [
    journey,
    ...(old ?? []),
  ])
}

export function removeOptimisticJourney(
  queryClient: QueryClient,
  address: string,
  txHash: string,
) {
  forgetHopTx(address, txHash)

  const queryKey = createXcScanQueryKey(address)
  queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
    (old ?? []).filter((journey) => !isOptimisticFor(journey, txHash)),
  )
}
