import {
  extrinsicByBlockAndIndexQuery,
  extrinsicByHashQuery,
  IndexerSdk,
} from "@galacticcouncil/indexer/indexer"
import { QueryClient } from "@tanstack/react-query"
import { first } from "remeda"
import { PublicClient } from "viem"

import { ToastData } from "@/states/toasts"

type ToastStatus = {
  processed: boolean
  dateUpdated: string
  status: "success" | "error" | "unknown"
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
      hash: hash as `0x${string}`,
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

const womrhole = (): ToastProcessorFn => async (_toast) => {
  // @TODO: Implement Wormhole toast processing
  return {
    status: "unknown",
    processed: true,
    dateUpdated: new Date().toISOString(),
  }
}

const snowbridge = (): ToastProcessorFn => async (_toast) => {
  // @TODO: Implement Snowbridge toast processing
  return {
    status: "unknown",
    processed: true,
    dateUpdated: new Date().toISOString(),
  }
}

export const processors = {
  evm,
  substrate,
  wormhole: womrhole,
  snowbridge,
  invalid,
} as const
