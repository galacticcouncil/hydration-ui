import { getChainAssetId, getChainId } from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import type { Transfer } from "@galacticcouncil/xc-sdk"
import type { QueryClient } from "@tanstack/react-query"

import { createXcScanQueryKey } from "@/modules/xcm/history/useXcScan"
import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { scale } from "@/utils/formatting"

const OPTIMISTIC_JOURNEY_PREFIX = "optimistic:"

export function getOptimisticJourneyId(txHash: string): string {
  return `${OPTIMISTIC_JOURNEY_PREFIX}${txHash}`
}

export function isOptimisticJourney(journey: XcJourney): boolean {
  return journey.correlationId.startsWith(OPTIMISTIC_JOURNEY_PREFIX)
}

function chainToUrn(chain: AnyChain): string {
  const ecosystem = chain.ecosystem
  if (!ecosystem) return ""
  return `urn:ocn:${ecosystem.toLowerCase()}:${getChainId(chain)}`
}

export function convertXcmFormValuesToOptimisticJourney(
  values: XcmFormValues,
  transfer: Transfer,
  txHash: string,
  fromAddress: string,
): XcJourney | undefined {
  const { srcChain, destChain, srcAsset, srcAmount, destAddress } = values
  const decimals = transfer.source.balance.decimals
  const now = Date.now()

  if (!srcAsset || !srcChain || !destChain) return

  const assetId = getChainAssetId(srcChain, srcAsset).toString()
  const originUrn = chainToUrn(srcChain)
  const destinationUrn = chainToUrn(destChain)

  return {
    id: 0,
    correlationId: getOptimisticJourneyId(txHash),
    status: "pending",
    type: "transfer",
    originProtocol: "xcm",
    destinationProtocol: "xcm",
    origin: originUrn,
    destination: destinationUrn,
    from: fromAddress,
    to: destAddress,
    sentAt: now,
    createdAt: now,
    stops: [],
    instructions: {},
    transactCalls: [],
    originTxPrimary: txHash,
    totalUsd: 0,
    assets: [
      {
        asset: `${originUrn}|${assetId}`,
        symbol: srcAsset?.originSymbol ?? "",
        amount: scale(srcAmount, decimals),
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
  const alreadyExists = current.some(
    (j) => isOptimisticJourney(j) && j.originTxPrimary === txHash,
  )
  if (alreadyExists) return
  const optimisticJourney = convertXcmFormValuesToOptimisticJourney(
    values,
    transfer,
    txHash,
    address,
  )
  if (!optimisticJourney) return
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
  const queryKey = createXcScanQueryKey(address)
  queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
    (old ?? []).filter(
      (j) => !(isOptimisticJourney(j) && j.originTxPrimary === txHash),
    ),
  )
}
