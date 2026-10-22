import {
  Extrinsic,
  extrinsicByBlockAndIndexQuery,
  extrinsicByHashQuery,
  NeckworkClient,
} from "@galacticcouncil/indexer/neckwork"
import { scanTransfersQuery } from "@galacticcouncil/indexer/scan"
import {
  HexString,
  transferscan,
  xcscan as xcscanExplorer,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Parachain } from "@galacticcouncil/xc-core"
import {
  OcelloidsHttpClient,
  XcJourney,
  XcJourneyBuilder,
} from "@galacticcouncil/xc-scan"
import { QueryClient } from "@tanstack/react-query"
import { PublicClient } from "viem"

import { transfersScanClient } from "@/api/scan"
import {
  fetchIntentOrder,
  resolveIntentOrder,
} from "@/modules/transactions/utils/toasts/intents"
import { getExplorerTxLink } from "@/modules/transactions/utils/tx"
import { getChainXcScanUrn } from "@/modules/xcm/history/utils/journey"
import { ToastData } from "@/states/toasts"
import { TransactionToastData } from "@/states/toasts"
import { TransactionType } from "@/states/transactions"

import { resolveExtrinsic } from "./extrinsics"

const ASSETHUB_KUSAMA_CHAIN_KEY = "assethub_kusama"
const ASSETHUB_POLKADOT_URN = getChainXcScanUrn(
  chainsMap.get("assethub") as Parachain,
)
const ASSETHUB_KUSAMA_URN = getChainXcScanUrn(
  chainsMap.get(ASSETHUB_KUSAMA_CHAIN_KEY) as Parachain,
)
const TRANSFER_MATCH_WINDOW_MS = 5 * 60 * 1000

type ToastStatus = {
  processed: boolean
  dateUpdated: string
  status: "success" | "error" | "warning" | "unknown"
  link?: string
}

const resolveExtrinsicToToastStatus = (
  toast: TransactionToastData,
  extrinsic: Extrinsic | null,
): ToastStatus => {
  const resolution = resolveExtrinsic(extrinsic)

  if (!resolution.processed) {
    return {
      status: "unknown",
      processed: false,
      dateUpdated: new Date().toISOString(),
    }
  }

  return {
    status: resolution.status,
    processed: true,
    dateUpdated: resolution.dateUpdated,
    link: getExplorerTxLink(
      toast.meta,
      resolution.blockHeight,
      resolution.extrinsicIndex,
    ),
  }
}

export type ToastProcessorFn = (
  toast: TransactionToastData,
) => Promise<ToastStatus>

function isAssetHubKusamaDstToast(toast: TransactionToastData): boolean {
  return (
    toast.meta.type === TransactionType.Xcm &&
    toast.meta.dstChainKey === ASSETHUB_KUSAMA_CHAIN_KEY
  )
}

function isAssetHubKusamaHopJourney(journey: XcJourney): boolean {
  return (
    journey.origin === ASSETHUB_POLKADOT_URN &&
    journey.destination === ASSETHUB_KUSAMA_URN
  )
}

function matchesTxHash(journey: XcJourney, txHash: string): boolean {
  return (
    journey.originTxPrimary === txHash ||
    journey.originTxSecondary === txHash ||
    journey.correlationId === txHash
  )
}

function journeyTime(journey: XcJourney): number {
  return journey.sentAt ?? journey.createdAt
}

function findMatchingJourney(
  journeys: XcJourney[],
  toast: ToastData,
  txHash: string,
): XcJourney | undefined {
  const byTxHash = journeys.find((journey) => matchesTxHash(journey, txHash))
  if (byTxHash) return byTxHash

  const toastTime = new Date(toast.dateCreated).getTime()
  const withinWindow = journeys.filter(
    (journey) =>
      Math.abs(journeyTime(journey) - toastTime) <= TRANSFER_MATCH_WINDOW_MS,
  )

  if (withinWindow.length === 0) return

  return [...withinWindow].sort(
    (a, b) =>
      Math.abs(journeyTime(a) - toastTime) -
      Math.abs(journeyTime(b) - toastTime),
  )[0]
}

async function fetchAssetHubKusamaHopJourneys(
  httpClient: OcelloidsHttpClient,
  address: string,
): Promise<XcJourney[]> {
  const res = await httpClient.queryCrosschain(
    XcJourneyBuilder.journeys()
      .address(address)
      .origins([ASSETHUB_POLKADOT_URN])
      .destinations([ASSETHUB_KUSAMA_URN])
      .build(),
    { limit: 10 },
  )

  return res.items.filter(isAssetHubKusamaHopJourney)
}

function resolveJourneyToToastStatus(journey: XcJourney): ToastStatus {
  const link = xcscanExplorer.tx(journey.correlationId)
  const dateUpdated = journey.recvAt
    ? new Date(journey.recvAt).toISOString()
    : new Date().toISOString()

  switch (journey.status) {
    case "received":
      return { status: "success", link, processed: true, dateUpdated }
    case "failed":
    case "timeout":
      return { status: "error", link, processed: true, dateUpdated }
    case "unknown":
      return { status: "unknown", link, processed: true, dateUpdated }
    case "sent":
    case "waiting":
    default:
      return {
        status: "unknown",
        processed: false,
        dateUpdated: new Date().toISOString(),
        link,
      }
  }
}

const invalid = (): ToastProcessorFn => async (toast) =>
  Promise.resolve({
    status: "unknown",
    processed: true,
    dateUpdated: toast.dateCreated ?? new Date().toISOString(),
  })

const evm =
  (
    queryClient: QueryClient,
    neckworkClient: NeckworkClient,
    evm: PublicClient,
  ): ToastProcessorFn =>
  async (toast) => {
    const hash = toast.meta.txHash
    const receipt = await evm.getTransactionReceipt({
      hash: hash as HexString,
    })

    const extrinsic = await queryClient.fetchQuery(
      extrinsicByBlockAndIndexQuery(
        neckworkClient,
        Number(receipt.blockNumber),
        Number(receipt.transactionIndex),
      ),
    )

    return resolveExtrinsicToToastStatus(toast, extrinsic)
  }

const substrate =
  (
    queryClient: QueryClient,
    neckworkClient: NeckworkClient,
  ): ToastProcessorFn =>
  async (toast) => {
    const hash = toast.meta.txHash
    const extrinsic = await queryClient.fetchQuery(
      extrinsicByHashQuery(neckworkClient, hash),
    )

    return resolveExtrinsicToToastStatus(toast, extrinsic)
  }

const basejump =
  (queryClient: QueryClient): ToastProcessorFn =>
  async (toast) => {
    // The scan finds a transfer by its origin tx too
    const { items } = await queryClient.fetchQuery(
      scanTransfersQuery(transfersScanClient, {
        q: toast.meta.txHash,
        type: "basejump",
        limit: 1,
      }),
    )
    const transfer = items[0]
    const link = transfer && transferscan.transfer(transfer.id)
    const dateUpdated = new Date().toISOString()

    switch (transfer?.status) {
      case "completed":
        return { status: "success", link, processed: true, dateUpdated }
      case "failed":
        return { status: "error", link, processed: true, dateUpdated }
      default:
        return { status: "unknown", link, processed: false, dateUpdated }
    }
  }

const xcscan =
  (address: string, httpClient: OcelloidsHttpClient): ToastProcessorFn =>
  async (toast) => {
    const txHash = toast.meta.txHash
    const useAddressLookup = isAssetHubKusamaDstToast(toast) && !!address

    let journey: XcJourney | undefined

    if (useAddressLookup) {
      const hopJourneys = await fetchAssetHubKusamaHopJourneys(
        httpClient,
        address,
      )
      journey = findMatchingJourney(hopJourneys, toast, txHash)
    } else {
      const res = await httpClient.queryCrosschain(
        { op: "journeys.list", criteria: { txHash } },
        { limit: 1 },
      )
      journey = res.items.find(
        (j) => j.originTxPrimary === txHash || j.originTxSecondary === txHash,
      )
    }

    if (!journey) {
      return {
        status: "unknown",
        processed: false,
        dateUpdated: new Date().toISOString(),
      }
    }

    return resolveJourneyToToastStatus(journey)
  }

const xcSwap = (): ToastProcessorFn => async (toast) => {
  const sequence =
    toast.meta.type === TransactionType.XcSwap ? toast.meta.sequence : undefined

  if (!sequence) {
    return {
      status: "unknown",
      processed: true,
      dateUpdated: new Date().toISOString(),
    }
  }

  const order = await fetchIntentOrder(sequence)

  if (!order) {
    return {
      status: "unknown",
      processed: false,
      dateUpdated: new Date().toISOString(),
    }
  }

  const { dateUpdated, ...resolution } = resolveIntentOrder(order)

  return {
    ...resolution,
    dateUpdated: dateUpdated ?? new Date().toISOString(),
  }
}

export const processors = {
  evm,
  substrate,
  basejump,
  xcscan,
  xcSwap,
  invalid,
} as const
