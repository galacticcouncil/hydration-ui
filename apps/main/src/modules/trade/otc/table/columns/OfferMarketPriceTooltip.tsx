import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { getOtcBuyAmountAfterFee } from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { useOtcOmnipoolComparison } from "@/modules/trade/otc/useOtcOmnipoolComparison"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly offer: OtcOfferTabular
}

/**
 * Tooltip body for the "vs. Market" cell. Renders the oracle-based comparison
 * (cheap, always available) plus an effective-price comparison against
 * Omnipool computed lazily — the router quote only fires when this component
 * mounts, i.e. when the user actually hovers the cell.
 */
export const OfferMarketPriceTooltip: FC<Props> = ({ offer }) => {
  const { t } = useTranslation(["trade", "common"])
  const rpc = useRpcProvider()

  const { data: feePct = "0" } = useQuery(otcTradeFeeQuery(rpc))

  const percentage = offer.marketPricePercentage ?? 0
  const isDiscount = percentage < 0

  const oracleText = t(
    isDiscount
      ? "otc.marketPrice.tooltip.discount"
      : "otc.marketPrice.tooltip.premium",
    {
      percentage: t("common:percent.compact", {
        value: Math.abs(percentage),
      }),
      marketNative: t("common:number", { value: offer.nativeMarketPrice }),
      assetIn: offer.assetIn.symbol,
      assetOut: offer.assetOut.symbol,
      marketUsd: t("common:currency", {
        value: offer.marketPrice,
        maximumFractionDigits: null,
      }),
    },
  )

  // OTC receive at full fill, net of the OTC fee, to compare like-for-like.
  const otcReceive = getOtcBuyAmountAfterFee(
    offer.assetAmountOut,
    feePct,
  ).toString()

  const { isLoading, comparison } = useOtcOmnipoolComparison({
    assetIn: offer.assetIn,
    assetOut: offer.assetOut,
    amountIn: offer.assetAmountIn,
    otcReceive,
  })

  const effectiveText = isLoading
    ? t("otc.vsOmnipool.loading")
    : comparison
      ? t(
          comparison.diffPct < 0.01
            ? "otc.vsOmnipool.tooltip.equal"
            : comparison.betterForTaker
              ? "otc.vsOmnipool.tooltip.better"
              : "otc.vsOmnipool.tooltip.worse",
          {
            percentage: t("common:percent.compact", {
              value: comparison.diffPct,
            }),
          },
        )
      : t("otc.vsOmnipool.unavailable")

  const effectiveColor =
    comparison && comparison.diffPct >= 0.01
      ? comparison.betterForTaker
        ? getToken("details.values.positive")
        : getToken("details.values.negative")
      : getToken("text.medium")

  return (
    <Flex direction="column" gap={6} sx={{ maxWidth: 260 }}>
      <Text fw={500} fs="p5" color={getToken("text.high")}>
        {oracleText}
      </Text>
      <Text fw={500} fs="p5" color={effectiveColor}>
        {effectiveText}
      </Text>
    </Flex>
  )
}
