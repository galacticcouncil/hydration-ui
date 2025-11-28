import {
  extrinsicByBlockAndIndexQuery,
  extrinsicByHashQuery,
  IndexerSdk,
} from "@galacticcouncil/indexer/indexer"
import {
  SnowbridgeSdk,
  snowbridgeStatusToEthQuery,
  snowbridgeStatusToPolkadotQuery,
  TransferStatusToEthQuery,
  TransferStatusToPolkadotQuery,
} from "@galacticcouncil/indexer/snowbridge"
import { snowbridgescan, wormholescan } from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xcm-core"
import { QueryClient } from "@tanstack/react-query"
import { first } from "remeda"
import { PublicClient } from "viem"

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

const womrhole = (): ToastProcessorFn => async (toast) => {
  const res = await fetch(
    wormholescan.api("operations", { txHash: toast.meta.txHash }),
  )
  const data = await res.json()

  const operation = first(data.operations ?? [])
  const operationStatus = operation?.targetChain?.status
  const operationVaa = operation?.vaa?.raw

  const isCompleted = !!operationVaa && operationStatus === "completed"

  return {
    status: isCompleted ? "success" : "unknown",
    processed: isCompleted,
    dateUpdated: new Date().toISOString(),
  }
}

const parseSnowbridgeResult = (
  result:
    | TransferStatusToPolkadotQuery["transferStatusToPolkadots"][number]
    | TransferStatusToEthQuery["transferStatusToEthereums"][number]
    | undefined,
): ToastStatus => {
  const status = (() => {
    if (!result) return "unknown"
    if (result.status === 1) return "success"
    if (result.status === 2) return "error"
    return "unknown"
  })()

  return {
    status,
    processed: !!result?.status && result.status > 0,
    link: result?.messageId ? snowbridgescan.tx(result.messageId) : undefined,
    dateUpdated:
      typeof result?.timestamp === "string"
        ? result.timestamp
        : new Date().toISOString(),
  }
}

const snowbridge =
  (queryClient: QueryClient, snowbridgeSdk: SnowbridgeSdk): ToastProcessorFn =>
  async (toast) => {
    const hash = toast.meta.txHash

    if (toast.meta.ecosystem === CallType.Evm) {
      const data = await queryClient.fetchQuery(
        snowbridgeStatusToPolkadotQuery(snowbridgeSdk, hash),
      )

      const result = data?.transferStatusToPolkadots?.[0]
      return parseSnowbridgeResult(result)
    }

    if (toast.meta.ecosystem === CallType.Substrate) {
      const data = await queryClient.fetchQuery(
        snowbridgeStatusToEthQuery(snowbridgeSdk, hash),
      )

      const result = data?.transferStatusToEthereums?.[0]
      return parseSnowbridgeResult(result)
    }

    return {
      status: "unknown",
      processed: false,
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
