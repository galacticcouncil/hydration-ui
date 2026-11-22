import { Flex, Skeleton, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OfferMarketPriceTooltip } from "@/modules/trade/otc/table/columns/OfferMarketPriceTooltip"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
  /** True when the viewer is the order's maker — flips the framing. */
  readonly isOwnOrder: boolean
}

export const OfferMarketPriceColumn: FC<Props> = ({ offer, isOwnOrder }) => {
  const { t } = useTranslation(["trade", "common"])

  // Still resolving the AMM fulfillment quote for this row.
  if (offer.isMarketLoading) {
    return <Skeleton sx={{ height: "2xs", mx: "auto", width: "3xl" }} />
  }

  const percentage = offer.marketPricePercentage

  // No good data to compare against (no AMM route / unviable quote) → N/A,
  // rather than a misleading number.
  if (percentage === null) {
    return (
      <Text fw={500} fs="p4" lh={1} color={getToken("text.low")} truncate>
        {t("otc.marketPrice.na")}
      </Text>
    )
  }

  const isAbove = percentage > 0
  const isBelow = percentage < 0

  // Taker reading: above the AMM = bad (red), below = good (green). For the
  // order's own maker that's backwards, so stay neutral and relabel.
  const color = isOwnOrder
    ? getToken("text.high")
    : isBelow
      ? getToken("details.values.positive")
      : isAbove
        ? getToken("details.values.negative")
        : getToken("text.high")

  const label = isOwnOrder
    ? isAbove
      ? t("otc.marketPrice.maker.above")
      : isBelow
        ? t("otc.marketPrice.maker.below")
        : undefined
    : isBelow
      ? t("otc.marketPrice.discount")
      : isAbove
        ? t("otc.marketPrice.premium")
        : undefined

  const tooltipVars = {
    percentage: t("common:percent.compact", { value: Math.abs(percentage) }),
    marketNative: t("common:number", { value: offer.nativeMarketPrice }),
    assetIn: offer.assetIn.symbol,
    assetOut: offer.assetOut.symbol,
    marketUsd: t("common:currency", {
      value: offer.marketPrice,
      maximumFractionDigits: null,
    }),
  }

  const makerTooltip = t(
    isBelow
      ? "otc.marketPrice.maker.tooltip.below"
      : "otc.marketPrice.maker.tooltip.above",
    tooltipVars,
  )

  return (
    <Tooltip
      text={
        isOwnOrder ? makerTooltip : <OfferMarketPriceTooltip offer={offer} />
      }
      asChild
    >
      <Flex direction="column" align="center" gap={2} sx={{ cursor: "help" }}>
        <Text fw={500} fs="p4" lh={1} color={color} truncate>
          {isBelow && "-"}
          {isAbove && "+"}
          {t("common:percent.compact", { value: Math.abs(percentage) })}
        </Text>
        {label && (
          <Text fw={500} fs="p6" lh={1} color={getToken("text.low")} truncate>
            {label}
          </Text>
        )}
      </Flex>
    </Tooltip>
  )
}
