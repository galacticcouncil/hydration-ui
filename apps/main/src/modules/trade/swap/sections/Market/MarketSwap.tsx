import { useAccount } from "@galacticcouncil/web3-connect"
import {
  EVM_PROVIDERS,
  SUBSTRATE_PROVIDERS,
} from "@galacticcouncil/web3-connect/src/config/providers"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { Market } from "@/modules/trade/swap/sections/Market/Market"
import { XcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwap"
import { XcSwapProvider } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const MarketSwap: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const { account, isConnected } = useAccount()

  const canRenderXcSwap =
    !isConnected ||
    (!!account?.provider &&
      [...EVM_PROVIDERS, ...SUBSTRATE_PROVIDERS].includes(account.provider))

  if (canRenderXcSwap) {
    return (
      <XcSwapProvider assetIn={assetIn} assetOut={assetOut}>
        <XcSwap />
      </XcSwapProvider>
    )
  }

  return <Market />
}
