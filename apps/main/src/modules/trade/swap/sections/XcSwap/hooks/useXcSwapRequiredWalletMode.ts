import {
  PROVIDERS_BY_WALLET_MODE,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"

type UseXcSwapRequiredWalletModeParams = {
  form: UseFormReturn<XcSwapFormValues>
  isCrossChain: boolean
}

import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { WalletMode } from "@galacticcouncil/web3-connect"

import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"

export const getXcSwapRequiredWalletMode = (
  isCrossChain: boolean,
  srcChain: XcChain | null,
): WalletMode | null => {
  if (!isCrossChain || !srcChain) return null

  // Cross-chain swaps from Hydration execute only via EVM
  if (srcChain.platform === HYDRATION_CHAIN_KEY) {
    return WalletMode.EVM
  }

  return null
}

export const useXcSwapRequiredWalletMode = ({
  form,
  isCrossChain,
}: UseXcSwapRequiredWalletModeParams) => {
  const { account, isConnected } = useAccount()
  const srcChain = form.watch("srcChain")

  const requiredWalletMode = useMemo(
    () => getXcSwapRequiredWalletMode(isCrossChain, srcChain),
    [isCrossChain, srcChain],
  )

  const isWalletCompatible = useMemo(() => {
    if (!requiredWalletMode) return true
    if (!isConnected || !account?.provider) return true

    return PROVIDERS_BY_WALLET_MODE[requiredWalletMode].includes(
      account.provider,
    )
  }, [account?.provider, isConnected, requiredWalletMode])

  return {
    requiredWalletMode,
    isWalletCompatible,
  }
}
