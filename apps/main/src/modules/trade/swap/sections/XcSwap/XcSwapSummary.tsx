import { Summary, SummaryRow } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { scaleHuman } from "@/utils/formatting"

const RELAY_FEE_DECIMALS = 18

export const XcSwapSummary = () => {
  const { t } = useTranslation("common")
  const { quote } = useXcSwap()
  const { watch } = useFormContext<XcSwapFormValues>()

  if (quote?.kind === "oc") {
    const trade = quote.trade
    const destAsset = watch("destAsset")

    const tradeFee = destAsset
      ? t("currency", {
          value: scaleHuman(trade.tradeFee, destAsset.decimals),
          symbol: destAsset.symbol,
        })
      : "-"

    return (
      <Summary separator={<SwapSectionSeparator />}>
        <SummaryRow label="Trade fee" content={tradeFee} />
        <SummaryRow
          label="Price impact"
          content={t("percent", { value: trade.priceImpactPct })}
        />
      </Summary>
    )
  }

  const trade = quote?.kind === "xc" ? quote.trade : null

  const maxFeeIn = trade
    ? t("currency", {
        value: trade.maxFeeIn.toDecimal(),
        symbol: trade.maxFeeIn.symbol,
      })
    : "-"

  const relayFee = trade
    ? t("currency", {
        value: scaleHuman(trade.maxRelayFee, RELAY_FEE_DECIMALS),
        symbol: "ETH",
      })
    : "-"

  const priceImpact = trade
    ? t("percent", { value: trade.priceImpactPct })
    : "-"

  const eta = trade
    ? t("interval.short", { value: trade.swapTimeEstimate * 1000 })
    : "-"

  const minAmountOut = trade
    ? t("currency", {
        value: trade.minAmountOut.toDecimal(),
        symbol: trade.minAmountOut.symbol,
      })
    : "-"

  return (
    <Summary separator={<SwapSectionSeparator />}>
      <SummaryRow label={t("minimumReceived")} content={minAmountOut} />
      <SummaryRow label="Price impact" content={priceImpact} />
      <SummaryRow label="Max fee in" content={maxFeeIn} />
      <SummaryRow label="Relay fee" content={relayFee} />
      <SummaryRow label="Estimated time" content={eta} />
    </Summary>
  )
}
