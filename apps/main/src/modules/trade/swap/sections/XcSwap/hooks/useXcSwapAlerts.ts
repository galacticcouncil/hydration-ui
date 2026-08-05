import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { getXcSwapErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapErrorMessages"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export type XcSwapAlertSeverity = "error" | "warning" | "info"

export type XcSwapAlert = {
  key: string
  message: string
  severity: XcSwapAlertSeverity
}

export const useXcSwapAlerts = (): XcSwapAlert[] => {
  const { t } = useTranslation("trade")
  const {
    originAssetMap,
    quote,
    quoteError,
    requiredWalletMode,
    isWalletCompatible,
  } = useXcSwap()
  const { watch } = useFormContext<XcSwapFormValues>()
  const sellAsset = watch("sellAsset")

  const sellAssetUnsupported =
    !!sellAsset && originAssetMap.size > 0 && !originAssetMap.has(sellAsset.id)

  return useMemo<XcSwapAlert[]>(() => {
    const alerts: XcSwapAlert[] = []

    if (requiredWalletMode && !isWalletCompatible) {
      alerts.push({
        key: "wallet-incompatible",
        message: t("xc.swap.alert.nonEvmWallet"),
        severity: "info",
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
    isWalletCompatible,
    quote,
    quoteError,
    requiredWalletMode,
    sellAssetUnsupported,
    t,
  ])
}
