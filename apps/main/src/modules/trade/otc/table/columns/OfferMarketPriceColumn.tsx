import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OfferMarketPriceTooltip } from "@/modules/trade/otc/table/columns/OfferMarketPriceTooltip"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
}

export const OfferMarketPriceColumn: FC<Props> = ({ offer }) => {
  const { t } = useTranslation(["trade", "common"])

  const percentage = offer.marketPricePercentage

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

  return (
    <Tooltip text={<OfferMarketPriceTooltip offer={offer} />} asChild>
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
