import { EvmParachain } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { createContext, useContext } from "react"

import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"

type XcmContextValue = {
  readonly isLoading: boolean
  readonly isConnectedAccountValid: boolean
  readonly transfer: Transfer | null
  readonly sourceChainAssetPairs: ChainAssetPair[]
  readonly destChainAssetPairs: ChainAssetPair[]
  readonly registryChain: EvmParachain
  readonly status: XcmTransferStatus
}

export const XcmContext = createContext<XcmContextValue>({
  isLoading: false,
  isConnectedAccountValid: false,
  transfer: null,
  sourceChainAssetPairs: [],
  destChainAssetPairs: [],
  registryChain: {} as EvmParachain,
  status: XcmTransferStatus.Default,
})

export const useXcmProvider = () => useContext(XcmContext)
