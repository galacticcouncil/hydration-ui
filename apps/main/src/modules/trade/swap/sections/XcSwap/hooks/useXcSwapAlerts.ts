import { useAccount } from "@galacticcouncil/web3-connect"
import { EVM_PROVIDERS } from "@galacticcouncil/web3-connect/src/config/providers"
import { useMemo } from "react"

export type XcSwapAlertSeverity = "error" | "warning" | "info"

export type XcSwapAlert = {
  key: string
  message: string
  severity: XcSwapAlertSeverity
}

export const useXcSwapAlerts = (isCrossChain: boolean): XcSwapAlert[] => {
  const { account, isConnected } = useAccount()

  return useMemo(() => {
    if (
      !isCrossChain ||
      !isConnected ||
      !account?.provider ||
      EVM_PROVIDERS.includes(account.provider)
    ) {
      return []
    }

    return [
      {
        key: "non-evm-wallet",
        message:
          "Cross-chain swap requires an EVM wallet. Connect an EVM-compatible wallet to continue.",
        severity: "error",
      },
    ]
  }, [account?.provider, isConnected, isCrossChain])
}
