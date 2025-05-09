import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DynamicFee, DynamicFeeRangeType } from "@/components"
import { Summary } from "@/components/Summary"
import { DCAFormValues } from "@/modules/trade/sections/DCA/DCA.form"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

// TODO integrate
const priceImpact = 5
const estTradeFees = 0.1
const tradeFeeRange: Record<DynamicFeeRangeType, number> = {
  low: 0.1,
  middle: 0.2,
  high: 0.3,
}

export const DCASummary: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<DCAFormValues>()

  const [sellAmount, sellAsset, buyAsset, interval] = watch([
    "sellAmount",
    "sellAsset",
    "buyAsset",
    "interval",
  ])

  const isSummaryShown = sellAsset && buyAsset && interval && sellAmount

  return (
    <div>
      <Flex direction="column" gap={8} py={8}>
        <Text fw={500} fs={14} lh={px(22)} color={getToken("text.medium")}>
          {t("summary")}
        </Text>
        {isSummaryShown && (
          <Flex gap={5}>
            <Text fw={500} fs="p3" lh={1} color={getToken("text.high")}>
              {t("trade:dca.summary.description", {
                sellAmount: t("number", { value: sellAmount }),
                sellSymbol: sellAsset.symbol,
                buySymbol: buyAsset.symbol,
                period: t(interval.type, { count: interval.value }),
              })}
            </Text>
            <Tooltip text="TODO" />
          </Flex>
        )}
      </Flex>
      <SwapSectionSeparator sx={{ mt: isSummaryShown ? 9 : 0 }} />
      <Summary
        separator={<SwapSectionSeparator />}
        rows={[
          {
            label: t("priceImpact"),
            content: t("percent", { value: priceImpact }),
          },
          {
            label: t("trade:dca.summary.estTradeFees"),
            content: (
              <DynamicFee
                value={estTradeFees}
                range={tradeFeeRange}
                tooltip="TODO"
              />
            ),
          },
        ]}
      />
    </div>
  )
}
