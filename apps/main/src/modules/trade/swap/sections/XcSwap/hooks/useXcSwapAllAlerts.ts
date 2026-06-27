import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import {
  useXcSwapAlerts,
  XcSwapAlert,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import { getXcSwapErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapErrorMessages"

type UseXcSwapAllAlertsParams = {
  form: UseFormReturn<XcSwapFormValues>
  originAssetMap: Map<string, XcAsset>
  isCrossChain: boolean
  quote: XcSwapQuote
  quoteError: Error | null
}

export const useXcSwapAllAlerts = ({
  form,
  originAssetMap,
  isCrossChain,
  quote,
  quoteError,
}: UseXcSwapAllAlertsParams): XcSwapAlert[] => {
  const { t } = useTranslation("trade")

  const sellAsset = form.watch("sellAsset")
  const alerts = useXcSwapAlerts(isCrossChain)

  const sellAssetUnsupported =
    !!sellAsset && originAssetMap.size > 0 && !originAssetMap.has(sellAsset.id)

  return useMemo<XcSwapAlert[]>(() => {
    const result = [...alerts]
    if (sellAssetUnsupported) {
      result.push({
        key: "src-asset-unsupported",
        message:
          "This asset can't be used as a swap source. Select a different asset.",
        severity: "error",
      })
    }
    if (quoteError) {
      result.push({
        key: "quote-error",
        message: quoteError.message,
        severity: "error",
      })
    }
    if (quote?.kind === "xc") {
      for (const error of quote.trade.errors) {
        result.push({
          key: `xc-trade-error-${error}`,
          message: getXcSwapErrorMessage(error, t),
          severity: "error",
        })
      }
    }
    return result
  }, [alerts, quote, quoteError, sellAssetUnsupported, t])
}
