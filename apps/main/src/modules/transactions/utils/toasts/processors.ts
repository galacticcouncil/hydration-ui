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
import { OcelloidsHttpClient, XcJourney } from "@galacticcouncil/xc-scan"
import { QueryClient } from "@tanstack/react-query"
import { first } from "remeda"
import { PublicClient } from "viem"

import { createBasejumpScanQueryKey } from "@/modules/xcm/history/useBasejumpScan"
import { ToastData } from "@/states/toasts"

type ToastStatus = {
  processed: boolean
  dateUpdated: string
  status: "success" | "error" | "unknown"
  link?: string
}

export type ToastProcessorFn = (toast: ToastData) => Promise<ToastStatus>

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
  (httpClient: OcelloidsHttpClient): ToastProcessorFn =>
  async (toast) => {
    const txHash = toast.meta.txHash

    const res = await httpClient.queryCrosschain(
      { op: "journeys.list", criteria: { txHash } },
      { limit: 1 },
    )
    const journey = res.items.find(
      (j) => j.originTxPrimary === txHash || j.originTxSecondary === txHash,
    )

    if (!journey) {
      return {
        status: "unknown",
        processed: false,
        dateUpdated: new Date().toISOString(),
      }
    }

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
        }
    }
  }

export const processors = {
  evm,
  substrate,
  basejump,
  xcscan,
  invalid,
} as const
