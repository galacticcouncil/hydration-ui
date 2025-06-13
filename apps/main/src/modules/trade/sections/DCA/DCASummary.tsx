import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Flex, Summary, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DcaSummarySkeleton } from "@/modules/trade/sections/DCA/DcaSummarySkeleton"
import { DcaFormValues } from "@/modules/trade/sections/DCA/useDcaForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly isLoading: boolean
}

export const DcaSummary: FC<Props> = ({ order, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<DcaFormValues>()

  const [sellAmount, sellAsset, buyAsset, interval] = watch([
    "sellAmount",
    "sellAsset",
    "buyAsset",
    "interval",
  ])

  if (isLoading) {
    return <DcaSummarySkeleton />
  }

  const isSummaryShown =
    sellAsset && buyAsset && interval && sellAmount && order

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
                timeframe: formatDistanceToNowStrict(
                  Date.now() + order.frequency,
                ),
                period: t(interval.type, { count: interval.value }),
              })}
            </Text>
            <Tooltip text="TODO" />
          </Flex>
        )}
      </Flex>
      <SwapSectionSeparator sx={{ mt: isSummaryShown ? 9 : 0 }} />
      {order && (
        <Summary
          separator={<SwapSectionSeparator />}
          rows={[
            {
              label: t("priceImpact"),
              content: t("percent", { value: order.tradeImpactPct }),
            },
          ]}
        />
      )}
    </div>
  )
}
