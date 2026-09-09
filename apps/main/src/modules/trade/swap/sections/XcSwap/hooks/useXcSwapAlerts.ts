import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { pickPrimaryXcSwapAlert } from "@/modules/trade/swap/sections/XcSwap/lib/pickPrimaryXcSwapAlert"
import { getXcSwapErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapErrorMessages"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export type XcSwapAlertSeverity = "error" | "warning" | "info"

export type XcSwapAlert = {
  key: string
  message: string
  severity: XcSwapAlertSeverity
}

export type XcSwapAlertsState = {
  alerts: XcSwapAlert[]
  hasBlockingAlerts: boolean
}

export const useXcSwapAlerts = (): XcSwapAlertsState => {
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

  return useMemo<XcSwapAlertsState>(() => {
    const blockingAlerts: XcSwapAlert[] = []

    if (requiredWalletMode && !isWalletCompatible) {
      blockingAlerts.push({
        key: "wallet-incompatible",
        message: t("xc.swap.alert.nonEvmWallet"),
        severity: "info",
      })

      return {
        alerts: blockingAlerts,
        hasBlockingAlerts: true,
      }
    }

    if (sellAssetUnsupported) {
      blockingAlerts.push({
        key: "src-asset-unsupported",
        message: t("xc.swap.alert.srcAssetUnsupported"),
        severity: "error",
      })
    }

    if (quoteError) {
      blockingAlerts.push({
        key: "quote-error",
        message: quoteError.message,
        severity: "error",
      })
    }

    if (quote?.kind === "xc") {
      for (const error of quote.swap.errors) {
        blockingAlerts.push({
          key: `xc-trade-error-${error}`,
          message: getXcSwapErrorMessage(error, t),
          severity: "error",
        })
      }
    }

    const primaryAlert = pickPrimaryXcSwapAlert(blockingAlerts)
    const alerts = primaryAlert ? [primaryAlert] : []

    return {
      alerts,
      hasBlockingAlerts: blockingAlerts.some(
        (alert) => alert.severity !== "info",
      ),
    }
  }, [
    isWalletCompatible,
    quote,
    quoteError,
    requiredWalletMode,
    sellAssetUnsupported,
    t,
  ])
}
