import {
  extrinsicByBlockAndIndexQuery,
  extrinsicByHashQuery,
  IndexerSdk,
} from "@galacticcouncil/indexer/indexer"
import {
  basejumpscan,
  HexString,
  stringEquals,
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
import { first } from "remeda"
import { PublicClient } from "viem"

import { createBasejumpScanQueryKey } from "@/modules/xcm/history/useBasejumpScan"
import { getChainXcScanUrn } from "@/modules/xcm/history/utils/journey"
import { ToastData } from "@/states/toasts"
import { TransactionType } from "@/states/transactions"

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
  status: "success" | "error" | "unknown"
  link?: string
}

export type ToastProcessorFn = (toast: ToastData) => Promise<ToastStatus>

function isAssetHubKusamaDstToast(toast: ToastData): boolean {
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
    indexerSdk: IndexerSdk,
    evm: PublicClient,
  ): ToastProcessorFn =>
  async (toast) => {
    const hash = toast.meta.txHash
    const receipt = await evm.getTransactionReceipt({
      hash: hash as HexString,
    })

    const res = await queryClient.fetchQuery(
      extrinsicByBlockAndIndexQuery(
        indexerSdk,
        Number(receipt.blockNumber),
        Number(receipt.transactionIndex),
      ),
    )

    const extrinsic = first(res?.extrinsics ?? [])

    if (!extrinsic) {
      return {
        status: "unknown",
        processed: false,
        dateUpdated: new Date().toISOString(),
      }
    }

    const status = (() => {
      if (extrinsic.success) return "success"
      if (extrinsic.error) return "error"
      return "unknown"
    })()

    return {
      status,
      processed: true,
      dateUpdated: extrinsic.block.timestamp,
    }
  }

const substrate =
  (queryClient: QueryClient, indexerSdk: IndexerSdk): ToastProcessorFn =>
  async (toast) => {
    const hash = toast.meta.txHash
    const res = await queryClient.fetchQuery(
      extrinsicByHashQuery(indexerSdk, hash),
    )

    const extrinsic = first(res?.extrinsics ?? [])

    if (!extrinsic) {
      return {
        status: "unknown",
        processed: false,
        dateUpdated: new Date().toISOString(),
      }
    }

    const status = (() => {
      if (extrinsic.success) return "success"
      if (extrinsic.error) return "error"
      return "unknown"
    })()

    return {
      status,
      processed: true,
      dateUpdated: extrinsic.block.timestamp,
    }
  }

const basejump =
  (address: string, queryClient: QueryClient): ToastProcessorFn =>
  async (toast) => {
    const bjScanJourneys = queryClient.getQueryData<XcJourney[]>(
      createBasejumpScanQueryKey(address),
    )
    const completedJourney = bjScanJourneys?.find(
      (journey) =>
        stringEquals(journey.originTxPrimary ?? "", toast.meta.txHash) &&
        journey.status === "received",
    )
    if (completedJourney) {
      return {
        status: "success",
        link: basejumpscan.tx(completedJourney.correlationId),
        processed: true,
        dateUpdated: completedJourney.recvAt
          ? new Date(completedJourney.recvAt).toISOString()
          : new Date().toISOString(),
      }
    }
    return {
      status: "unknown",
      processed: false,
      dateUpdated: new Date().toISOString(),
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

export const processors = {
  evm,
  substrate,
  basejump,
  xcscan,
  invalid,
} as const
