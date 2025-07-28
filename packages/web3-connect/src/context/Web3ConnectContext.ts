import { SquidSdk } from "@galacticcouncil/indexer/squid"
import { createContext, useContext } from "react"

import { Web3ConnectModalPage } from "@/config/modal"

export type Web3ConnectContextType = {
  page: Web3ConnectModalPage
  setPage: (page: Web3ConnectModalPage) => void
  squidSdk: SquidSdk
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
