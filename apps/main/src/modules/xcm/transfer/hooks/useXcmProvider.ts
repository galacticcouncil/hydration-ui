import { EvmParachain } from "@galacticcouncil/xcm-core"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import { createContext, useContext } from "react"

import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"

type XcmContextValue = {
  readonly isLoading: boolean
  readonly transfer: Transfer | null
  readonly sourceChainAssetPairs: ChainAssetPair[]
  readonly destChainAssetPairs: ChainAssetPair[]
  readonly registryChain: EvmParachain
}

export const XcmContext = createContext<XcmContextValue>({
  isLoading: false,
  transfer: null,
  sourceChainAssetPairs: [],
  destChainAssetPairs: [],
  registryChain: {} as EvmParachain,
})

export const useXcmProvider = () => useContext(XcmContext)
