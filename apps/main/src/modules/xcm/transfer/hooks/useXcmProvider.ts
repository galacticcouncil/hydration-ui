import { DryRunError } from "@galacticcouncil/utils"
import { EvmParachain } from "@galacticcouncil/xc-core"
import { Call, Transfer } from "@galacticcouncil/xc-sdk"
import { createContext, useContext } from "react"

import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"

export type XcmAlert = {
  key: string
  message: string
}

type XcmContextValue = {
  readonly isLoading: boolean
  readonly isLoadingCall: boolean
  readonly isLoadingTransfer: boolean
  readonly isConnectedAccountValid: boolean
  readonly transfer: Transfer | null
  readonly call: Call | null
  readonly dryRunError: DryRunError | null
  readonly alerts: XcmAlert[]
  readonly sourceChainAssetPairs: ChainAssetPair[]
  readonly destChainAssetPairs: ChainAssetPair[]
  readonly registryChain: EvmParachain
  readonly status: XcmTransferStatus
}

export const XcmContext = createContext<XcmContextValue>({
  isLoading: false,
  isLoadingCall: false,
  isLoadingTransfer: false,
  isConnectedAccountValid: false,
  transfer: null,
  call: null,
  dryRunError: null,
  alerts: [],
  sourceChainAssetPairs: [],
  destChainAssetPairs: [],
  registryChain: {} as EvmParachain,
  status: XcmTransferStatus.Default,
})

export const useXcmProvider = () => useContext(XcmContext)
