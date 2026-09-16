import { Alert } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { lazy } from "react"
import { useTranslation } from "react-i18next"

import { ENV } from "@/config/env"
import { useResetSharedSellAmountOnUnmount } from "@/modules/trade/swap/lib/useSharedSellAmount"

const SwapPageDesktop = lazy(async () => ({
  default: await import("@/modules/trade/swap/SwapPageDesktop").then(
    (m) => m.SwapPageDesktop,
  ),
}))

const SwapPageMobile = lazy(async () => ({
  default: await import("@/modules/trade/swap/SwapPageMobile").then(
    (m) => m.SwapPageMobile,
  ),
}))

export const SwapPage = () => {
  useResetSharedSellAmountOnUnmount()

  const { t } = useTranslation("trade")
  const { gte } = useBreakpoints()

  return (
    <>
      {ENV.VITE_TRADING_DISABLED && (
        <Alert
          variant="warning"
          description={t("trade.disabled.description")}
          sx={{ mb: "m" }}
        />
      )}
      {gte("lg") ? <SwapPageDesktop /> : <SwapPageMobile />}
    </>
  )
}
