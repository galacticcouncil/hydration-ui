import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly percentage: number | null
  readonly marketPrice: string | null
  readonly nativeMarketPrice: string | null
  readonly assetInSymbol: string
  readonly assetOutSymbol: string
}

export const OfferMarketPriceColumn: FC<Props> = ({
  percentage,
  marketPrice,
  nativeMarketPrice,
  assetInSymbol,
  assetOutSymbol,
}) => {
  const { t } = useTranslation(["trade", "common"])

  if (percentage === null) {
    return (
      <Text fw={500} fs="p4" lh={1} color={getToken("text.low")} truncate>
        —
      </Text>
    )
  }

  const isDiscount = percentage < 0
  const isPremium = percentage > 0

  const color = isDiscount
    ? getToken("details.values.positive")
    : isPremium
      ? getToken("details.values.negative")
      : getToken("text.high")

  const label = isDiscount
    ? t("otc.marketPrice.discount")
    : isPremium
      ? t("otc.marketPrice.premium")
      : undefined

  const tooltipKey = isDiscount
    ? "otc.marketPrice.tooltip.discount"
    : "otc.marketPrice.tooltip.premium"

  const tooltip = t(tooltipKey, {
    percentage: t("common:percent.compact", { value: Math.abs(percentage) }),
    marketNative: t("common:number", { value: nativeMarketPrice }),
    assetIn: assetInSymbol,
    assetOut: assetOutSymbol,
    marketUsd: t("common:currency", {
      value: marketPrice,
      maximumFractionDigits: null,
    }),
  })

  return (
    <Tooltip text={tooltip} asChild>
      <Flex direction="column" align="center" gap={2} sx={{ cursor: "help" }}>
        <Text fw={500} fs="p4" lh={1} color={color} truncate>
          {isDiscount && "-"}
          {isPremium && "+"}
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
