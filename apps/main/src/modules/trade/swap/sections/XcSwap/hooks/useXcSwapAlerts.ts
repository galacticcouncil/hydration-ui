import { useAccount } from "@galacticcouncil/web3-connect"
import { EVM_PROVIDERS } from "@galacticcouncil/web3-connect/src/config/providers"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import { getXcSwapErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapErrorMessages"

export type XcSwapAlertSeverity = "error" | "warning" | "info"

export type XcSwapAlert = {
  key: string
  message: string
  severity: XcSwapAlertSeverity
}

type UseXcSwapAlertsParams = {
  form: UseFormReturn<XcSwapFormValues>
  originAssetMap: Map<string, XcAsset>
  isCrossChain: boolean
  quote: XcSwapQuote
  quoteError: Error | null
}

export const useXcSwapAlerts = ({
  form,
  originAssetMap,
  isCrossChain,
  quote,
  quoteError,
}: UseXcSwapAlertsParams): XcSwapAlert[] => {
  const { t } = useTranslation("trade")
  const { account, isConnected } = useAccount()

  const sellAsset = form.watch("sellAsset")

  const sellAssetUnsupported =
    !!sellAsset && originAssetMap.size > 0 && !originAssetMap.has(sellAsset.id)

  return useMemo<XcSwapAlert[]>(() => {
    const alerts: XcSwapAlert[] = []

    if (
      isCrossChain &&
      isConnected &&
      account?.provider &&
      !EVM_PROVIDERS.includes(account.provider)
    ) {
      alerts.push({
        key: "non-evm-wallet",
        message: t("xc.swap.alert.nonEvmWallet"),
        severity: "error",
      })

      return alerts
    }

    if (sellAssetUnsupported) {
      alerts.push({
        key: "src-asset-unsupported",
        message: t("xc.swap.alert.srcAssetUnsupported"),
        severity: "error",
      })
    }
    if (quoteError) {
      alerts.push({
        key: "quote-error",
        message: quoteError.message,
        severity: "error",
      })
    }
    if (quote?.kind === "xc") {
      for (const error of quote.swap.errors) {
        alerts.push({
          key: `xc-trade-error-${error}`,
          message: getXcSwapErrorMessage(error, t),
          severity: "error",
        })
      }
    }
    return alerts
  }, [
    account?.provider,
    isConnected,
    isCrossChain,
    quote,
    quoteError,
    sellAssetUnsupported,
    t,
  ])
}
