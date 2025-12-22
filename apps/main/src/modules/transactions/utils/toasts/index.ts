import { IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { SnowbridgeSdk } from "@galacticcouncil/indexer/snowbridge"
import { CallType } from "@galacticcouncil/xc-core"
import { QueryClient } from "@tanstack/react-query"
import { differenceInMinutes } from "date-fns"
import { PublicClient } from "viem"

import {
  processors,
  ToastProcessorFn,
} from "@/modules/transactions/utils/toasts/processors"
import { ToastData, ToastMeta } from "@/states/toasts"
import { TransactionType, XcmTag } from "@/states/transactions"

enum ToastProcessorType {
  Evm = "Evm",
  Substrate = "Substrate",
  Wormhole = "Wormhole",
  Snowbridge = "Snowbridge",
  Unknown = "Unknown",
}

const MAX_TOAST_MINUTE_AGE = {
  [ToastProcessorType.Evm]: 60,
  [ToastProcessorType.Substrate]: 60,
  [ToastProcessorType.Wormhole]: 70,
  [ToastProcessorType.Snowbridge]: 70,
  [ToastProcessorType.Unknown]: 0,
} as const

const REQUIRED_TOAST_META_KEYS: (keyof ToastMeta)[] = [
  "type",
  "txHash",
  "ecosystem",
]

const validateToastForProcessing = (
  type: ToastProcessorType,
  toast: ToastData,
): boolean => {
  if (REQUIRED_TOAST_META_KEYS.some((key) => !toast.meta[key])) {
    return false
  }

  const toastAgeInMinutes = differenceInMinutes(
    new Date(),
    new Date(toast.dateCreated),
  )

  return toastAgeInMinutes < MAX_TOAST_MINUTE_AGE[type]
}

const getToastProcessorType = (toast: ToastData): ToastProcessorType => {
  const { type, ecosystem } = toast.meta

  const tags = type === TransactionType.Xcm ? (toast.meta.tags ?? []) : []

  switch (true) {
    case type === TransactionType.Onchain && ecosystem === CallType.Evm:
      return ToastProcessorType.Evm

    case type === TransactionType.Onchain && ecosystem === CallType.Substrate:
      return ToastProcessorType.Substrate

    case type === TransactionType.Xcm && tags.includes(XcmTag.Wormhole):
      return ToastProcessorType.Wormhole

    case type === TransactionType.Xcm && tags.includes(XcmTag.Snowbridge):
      return ToastProcessorType.Snowbridge

    default:
      return ToastProcessorType.Unknown
  }
}

export const createToastProcessorFn = (
  queryClient: QueryClient,
  indexerSdk: IndexerSdk,
  snowbridgeSdk: SnowbridgeSdk,
  evm: PublicClient,
): ToastProcessorFn => {
  const substrateProcessor = processors.substrate(queryClient, indexerSdk)
  const evmProcessor = processors.evm(queryClient, indexerSdk, evm)
  const wormholeProcessor = processors.wormhole(queryClient, indexerSdk, evm)
  const snowbridgeProcessor = processors.snowbridge(queryClient, snowbridgeSdk)
  const invalidProcessor = processors.invalid()

  return async (toast) => {
    const type = getToastProcessorType(toast)
    const isValidToast = validateToastForProcessing(type, toast)

    if (!isValidToast) {
      return invalidProcessor(toast)
    }

    switch (type) {
      case ToastProcessorType.Substrate:
        return substrateProcessor(toast)
      case ToastProcessorType.Evm:
        return evmProcessor(toast)
      case ToastProcessorType.Wormhole:
        return wormholeProcessor(toast)
      case ToastProcessorType.Snowbridge:
        return snowbridgeProcessor(toast)
      case ToastProcessorType.Unknown:
        return invalidProcessor(toast)
    }
  }
}
