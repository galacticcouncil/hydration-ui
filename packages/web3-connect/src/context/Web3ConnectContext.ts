import { hydration } from "@galacticcouncil/descriptors"
import { NeckworkClient } from "@galacticcouncil/indexer/neckwork"
import { TypedApi } from "polkadot-api"
import { createContext, ReactNode, useContext } from "react"

import { Web3ConnectModalPage } from "@/config/modal"
import {
  Account,
  WalletMode,
  Web3ConnectModalMeta,
} from "@/hooks/useWeb3Connect"

export type Web3ConnectContextType = {
  isControlled: boolean
  isPage?: boolean
  accountFilter?: (account: Account) => boolean
  customSource?: { title: string; content: ReactNode }
  onBack?: () => void
  page: Web3ConnectModalPage
  setPage: (page: Web3ConnectModalPage) => void
  neckwork: NeckworkClient
  papi: TypedApi<typeof hydration>
  onAccountSelect: (account: Account) => void
  mode: WalletMode
  meta?: Web3ConnectModalMeta | null
  setModalContentWidth: (width: string) => void
}

const Web3ConnectContext = createContext<Web3ConnectContextType | null>(null)

export const Web3ConnectProvider = Web3ConnectContext.Provider

export const useWeb3ConnectContext = () => {
  const context = useContext(Web3ConnectContext)
  if (!context) {
    throw new Error(
      "useWeb3ConnectContext must be used within a Web3ConnectProvider",
    )
  }
  return context
}
