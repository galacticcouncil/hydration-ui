import {
  getChainAssetId,
  HYDRATION_CHAIN_KEY,
  isEvmParachainAccount,
  safeConvertSS58toH160,
} from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import type { Transfer } from "@galacticcouncil/xc-sdk"
import type { QueryClient } from "@tanstack/react-query"

import { createXcScanQueryKey } from "@/modules/xcm/history/useXcScan"
import { getChainXcScanUrn } from "@/modules/xcm/history/utils/journey"
import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmTag } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const TRANSFER_MATCH_WINDOW_MS = 5 * 60 * 1000
const ASSETHUB_KUSAMA_CHAIN_KEY = "assethub_kusama"
const HYDRATION_URN = "urn:ocn:polkadot:2034"
const ASSETHUB_KUSAMA_URN = "urn:ocn:kusama:1000"

const OPTIMISTIC_JOURNEY_PREFIX = "optimistic:"

const pendingHopTxByAddress = new Map<string, Map<string, number>>()

function pruneExpiredPendingHops(address: string) {
  const pending = pendingHopTxByAddress.get(address)
  if (!pending) return

  const now = Date.now()
  for (const [txHash, ts] of pending) {
    if (now - ts > TRANSFER_MATCH_WINDOW_MS) {
      pending.delete(txHash)
    }
  }

  if (pending.size === 0) {
    pendingHopTxByAddress.delete(address)
  }
}

export function trackPendingHop(address: string, txHash: string) {
  if (!txHash) return

  pruneExpiredPendingHops(address)

  let pending = pendingHopTxByAddress.get(address)
  if (!pending) {
    pending = new Map()
    pendingHopTxByAddress.set(address, pending)
  }

  pending.set(txHash, Date.now())
}

export function clearPendingHop(address: string, txHash: string) {
  pendingHopTxByAddress.get(address)?.delete(txHash)
}

export function isPendingHop(
  address: string,
  txHash: string | null | undefined,
): boolean {
  if (!txHash) return false

  pruneExpiredPendingHops(address)

  const ts = pendingHopTxByAddress.get(address)?.get(txHash)
  if (!ts) return false

  return Date.now() - ts <= TRANSFER_MATCH_WINDOW_MS
}

export function isHopRouteTransfer(
  srcChain?: AnyChain | null,
  destChain?: AnyChain | null,
): boolean {
  if (!srcChain || !destChain) return false

  // Only hydration <-> assethub_kusama produces the dual SSE journey pattern.
  // Regular routes (e.g. hydration -> assethub polkadot) emit a single journey.
  const isHydration = (chain: AnyChain) => chain.key === HYDRATION_CHAIN_KEY
  const isAssetHubKusama = (chain: AnyChain) =>
    chain.key === ASSETHUB_KUSAMA_CHAIN_KEY

  return (
    (isHydration(srcChain) && isAssetHubKusama(destChain)) ||
    (isAssetHubKusama(srcChain) && isHydration(destChain))
  )
}

export function isHopRouteJourney(journey: XcJourney): boolean {
  // Indexed hop journeys span both networks; used to avoid ignoring unrelated
  // hop legs when unrelated indexed journeys already exist in history.
  const touchesHydration =
    journey.origin === HYDRATION_URN || journey.destination === HYDRATION_URN
  const touchesAssetHubKusama =
    journey.origin === ASSETHUB_KUSAMA_URN ||
    journey.destination === ASSETHUB_KUSAMA_URN

  return touchesHydration && touchesAssetHubKusama
}

export function getOptimisticJourneyId(txHash: string): string {
  return `${OPTIMISTIC_JOURNEY_PREFIX}${txHash}`
}

export function isOptimisticJourney(journey: XcJourney): boolean {
  return journey.correlationId.startsWith(OPTIMISTIC_JOURNEY_PREFIX)
}

export function isIndexedTransferJourney(journey: XcJourney): boolean {
  // Canonical xc-scan journey for a multi-hop transfer; arrives after the hop leg.
  return !journey.originTxPrimary && !journey.originTxSecondary
}

export function isOptimisticJourneyForTxHash(
  journey: XcJourney,
  txHash: string,
): boolean {
  return (
    isOptimisticJourney(journey) &&
    (journey.originTxPrimary === txHash || journey.originTxSecondary === txHash)
  )
}

export function shouldRemoveJourneyForIncoming(
  item: XcJourney,
  incoming: XcJourney,
  address?: string,
): boolean {
  if (item.correlationId === incoming.correlationId) {
    return true
  }

  // Real journey arrived with a tx hash — drop the matching optimistic placeholder.
  if (
    isOptimisticJourneyForTxHash(item, incoming.originTxPrimary ?? "") ||
    isOptimisticJourneyForTxHash(item, incoming.originTxSecondary ?? "")
  ) {
    return true
  }

  if (!address || !isIndexedTransferJourney(incoming)) {
    if (
      !isOptimisticJourney(item) &&
      !!incoming.originTxPrimary &&
      item.originTxPrimary === incoming.originTxPrimary
    ) {
      return true
    }

    return false
  }

  // Indexed journey arrived — drop the hop leg (or optimistic) keyed by pending tx.
  if (
    address &&
    isIndexedTransferJourney(incoming) &&
    item.originTxPrimary &&
    isPendingHop(address, item.originTxPrimary)
  ) {
    return true
  }

  if (
    !isOptimisticJourney(item) &&
    !!incoming.originTxPrimary &&
    item.originTxPrimary === incoming.originTxPrimary
  ) {
    return true
  }

  return false
}

export function shouldIgnoreNewJourney(
  previous: XcJourney[],
  incoming: XcJourney,
): boolean {
  return previous.some((journey) => {
    const isOptimisticPrimary = isOptimisticJourneyForTxHash(
      journey,
      incoming.originTxPrimary ?? "",
    )
    const isOptimisticSecondary = isOptimisticJourneyForTxHash(
      journey,
      incoming.originTxSecondary ?? "",
    )
    return (
      journey.originProtocol === "basejump" &&
      (isOptimisticPrimary || isOptimisticSecondary)
    )
  })
}

export function shouldIgnoreIncomingJourney(
  previous: XcJourney[],
  incoming: XcJourney,
  address?: string,
): boolean {
  if (shouldIgnoreNewJourney(previous, incoming)) {
    return true
  }

  if (
    address &&
    incoming.originTxPrimary &&
    isPendingHop(address, incoming.originTxPrimary)
  ) {
    return previous.some(
      (journey) =>
        isIndexedTransferJourney(journey) && isHopRouteJourney(journey),
    )
  }

  return false
}

function dedupeJourneyList(
  address: string,
  journeys: XcJourney[],
): XcJourney[] {
  return journeys.filter((journey, index, list) => {
    const supersedingJourney = list.find(
      (other, otherIndex) =>
        otherIndex !== index &&
        shouldRemoveJourneyForIncoming(journey, other, address),
    )

    if (
      supersedingJourney &&
      journey.originTxPrimary &&
      isIndexedTransferJourney(supersedingJourney)
    ) {
      clearPendingHop(address, journey.originTxPrimary)
    }

    return !supersedingJourney
  })
}

export function mergeLoadedJourneysWithOptimistic(
  address: string,
  previous: XcJourney[] | undefined,
  loaded: XcJourney[],
): XcJourney[] {
  const optimistics = (previous ?? []).filter(isOptimisticJourney)
  const survivingOptimistics = optimistics.filter(
    (optimistic) =>
      !loaded.some((journey) =>
        shouldRemoveJourneyForIncoming(optimistic, journey, address),
      ),
  )

  return dedupeJourneyList(address, [...survivingOptimistics, ...loaded])
}

export function convertXcmFormValuesToOptimisticJourney(
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
    correlationId: getOptimisticJourneyId(txHash),
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
  const current = queryClient.getQueryData<XcJourney[]>(queryKey) ?? []
  const alreadyExists = current.some((j) =>
    isOptimisticJourneyForTxHash(j, txHash),
  )
  if (alreadyExists) return
  const optimisticJourney = convertXcmFormValuesToOptimisticJourney(
    values,
    transfer,
    txHash,
    address,
  )
  if (!optimisticJourney) return

  // Hop routes need tx-hash tracking so the later indexed journey can dedupe.
  if (isHopRouteTransfer(values.srcChain, values.destChain)) {
    trackPendingHop(address, txHash)
  }

  queryClient.setQueryData<XcJourney[]>(queryKey, (old) => [
    optimisticJourney,
    ...(old ?? []),
  ])
}

export function removeOptimisticJourney(
  queryClient: QueryClient,
  address: string,
  txHash: string,
) {
  clearPendingHop(address, txHash)

  const queryKey = createXcScanQueryKey(address)
  queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
    (old ?? []).filter((j) => !isOptimisticJourneyForTxHash(j, txHash)),
  )
}
