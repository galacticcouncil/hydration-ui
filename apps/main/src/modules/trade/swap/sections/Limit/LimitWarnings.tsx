import { Alert, Flex, Modal, TextButton } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

// Minimum headroom between slippage tolerance and price impact before showing a warning.
// If headroom (slippage% - |priceImpact%|) is below this threshold, the trade is at risk.
const MIN_HEADROOM_PCT = 0.5

// Same tolerance as useSubmitLimitOrder — used to detect market mode.
const MARKET_PRICE_TOLERANCE = 0.001

export const LimitWarnings: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const rpc = useRpcProvider()
  const { watch } = useFormContext<LimitFormValues>()

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const [sellAsset, buyAsset, sellAmount, limitPrice] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "limitPrice",
  ])

  const { data: bestSellData } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount || "0",
    }),
  )

  // Detect market mode the same way LimitSummary does: limitPrice ≈ router quote rate.
  const isMarketMode = useMemo(() => {
    if (!bestSellData || !sellAmount || !buyAsset || !limitPrice) return false
    try {
      if (Big(sellAmount).lte(0) || Big(limitPrice).lte(0)) return false
      const amountOutHuman = scaleHuman(
        bestSellData.amountOut,
        buyAsset.decimals,
      )
      if (!amountOutHuman || Big(amountOutHuman).lte(0)) return false
      const mp = Big(amountOutHuman).div(sellAmount)
      return mp
        .minus(Big(limitPrice))
        .abs()
        .lt(mp.times(MARKET_PRICE_TOLERANCE))
    } catch {
      return false
    }
  }, [bestSellData, sellAmount, buyAsset, limitPrice])

  const shouldWarn = useMemo(() => {
    if (!isMarketMode) return false
    if (!bestSellData || !sellAmount) return false

    const impactPct = Math.abs(bestSellData.priceImpactPct)
    const headroom = Number(swapSlippage) - impactPct
    return headroom < MIN_HEADROOM_PCT
  }, [isMarketMode, bestSellData, sellAmount, swapSlippage])

  if (!shouldWarn || !bestSellData) return null

  const impactPct = Math.abs(bestSellData.priceImpactPct).toFixed(2)

  return (
    <Flex direction="column" gap="s" mt="base">
      <Alert
        variant="warning"
        description={t("trade:limit.warn.slippageHeadroom", {
          slippage: swapSlippage,
          impact: impactPct,
        })}
        action={
          <TextButton
            variant="underline"
            onClick={() => setIsSettingsOpen(true)}
          >
            {t("trade:limit.warn.slippageHeadroom.cta")}
          </TextButton>
        }
      />
      <Modal
        variant="popup"
        open={isSettingsOpen}
        onOpenChange={() => setIsSettingsOpen(false)}
      >
        <SettingsModal />
      </Modal>
    </Flex>
  )
}
