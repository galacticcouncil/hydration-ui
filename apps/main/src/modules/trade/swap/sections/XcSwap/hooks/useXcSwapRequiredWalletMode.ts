import {
  HYDRATION_CHAIN_KEY,
  isEvmParachainAccount,
  isSS58Address,
} from "@galacticcouncil/utils"
import {
  Account,
  PROVIDERS_BY_WALLET_MODE,
  useAccount,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"

type UseXcSwapRequiredWalletModeParams = {
  form: UseFormReturn<XcSwapFormValues>
  isCrossChain: boolean
}

const isAccountCompatibleWithWalletMode = (
  account: Account,
  mode: WalletMode,
): boolean => {
  if (account.provider === WalletProviderType.ExternalWallet) {
    const isEvmAddress = isEvmParachainAccount(account.address)

    switch (mode) {
      case WalletMode.EVM:
        return isEvmAddress
      case WalletMode.Substrate:
        return !isEvmAddress && isSS58Address(account.address)
      case WalletMode.Default:
        return true
      default:
        return false
    }
  }

  return PROVIDERS_BY_WALLET_MODE[mode].includes(account.provider)
}

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
    if (!isConnected || !account) return true

    return isAccountCompatibleWithWalletMode(account, requiredWalletMode)
  }, [account, isConnected, requiredWalletMode])

  return {
    requiredWalletMode,
    isWalletCompatible,
  }
}
